package org.vote.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.vote.dtos.OptionsDTO;
import org.vote.dtos.PollDTO;
import org.vote.entities.Options;
import org.vote.entities.Poll;
import org.vote.entities.User;
import org.vote.repositories.OptionsRepository;
import org.vote.repositories.PollRepository;
import org.vote.repositories.VoteRepository;
import org.vote.security.JwtService;
import org.vote.entities.Vote;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {

    private final JwtService jwtService;

    private final PollRepository pollRepository;

    private final OptionsRepository optionsRepository;

    private final VoteRepository voteRepository;

    public PollDTO getPollDTOInService(Poll poll) {
        User loggedInUser = jwtService.getLoggedInUser();

        PollDTO pollDTO = new PollDTO();
        pollDTO.setId(poll.getId());
        pollDTO.setQuestion(poll.getQuestion());
        pollDTO.setExpiredAt(poll.getExpiredAt());
        pollDTO.setExpired(poll.getExpiredAt() != null && poll.getExpiredAt().before(new Date()));
        pollDTO.setPostedDate(poll.getPostedDate());

        pollDTO.setOptionsDTOS(
                poll.getOptions()
                        .stream()
                        .map(options -> this.getOptionsDTO(options, loggedInUser.getId(), poll.getId()))
                        .sorted(Comparator.comparing(OptionsDTO::getVoteCount).reversed())
                        .collect(Collectors.toList())
        );

        pollDTO.setTotalVoteCount(poll.getTotalVoteCount());

        User pollOwner = poll.getUser();

        if (loggedInUser != null && pollOwner.getId().equals(loggedInUser.getId())) {
            pollDTO.setUserName("You");
        } else {
            pollDTO.setUserName(pollOwner.getFirstName() + " " + pollOwner.getLastName());
        }

        pollDTO.setUserId(pollOwner.getId());

        if (loggedInUser != null) {
            pollDTO.setVoted(voteRepository.existsByPollIdAndUserId(poll.getId(), loggedInUser.getId()));
        }

        return pollDTO;
    }

    public OptionsDTO getOptionsDTO(Options options, Long userId, Long pollId) {
        OptionsDTO optionsDTO = new OptionsDTO();
        optionsDTO.setId(options.getId());
        optionsDTO.setTitle(options.getTitle());
        optionsDTO.setPollId(options.getPoll().getId());
        optionsDTO.setVoteCount(options.getVoteCount());
        optionsDTO.setUserVotedThisOption(voteRepository.existsByPollIdAndUserIdAndOptionsId(pollId, userId, options.getId()));
        return optionsDTO;
    }

    public PollDTO postPoll(PollDTO pollDTO) {
        User user = jwtService.getLoggedInUser();
        if(user != null) {
            Poll poll = new Poll();
            poll.setQuestion(pollDTO.getQuestion());
            poll.setPostedDate(new Date());
            poll.setExpiredAt(pollDTO.getExpiredAt());
            poll.setUser(user);
            poll.setTotalVoteCount(0);
            Poll createdPoll = pollRepository.save(poll);

            List<Options> options = new ArrayList<>();
            for (String optionTitle : pollDTO.getOptions()) {
                Options option = new Options();
                option.setTitle(optionTitle);
                option.setPoll(createdPoll);
                option.setVoteCount(0);
                options.add(option);
            }
            List<Options> savedOptions = optionsRepository.saveAll(options);
            poll.setOptions(savedOptions);
            pollRepository.save(poll);

            return getPollDTOInService(createdPoll);
        }

        return null;
    }

    public void deletePoll(Long id) {
        User user = jwtService.getLoggedInUser();

        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Poll not found"));

        if (!poll.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can delete only your own polls");
        }

        pollRepository.delete(poll);
    }

    public List<PollDTO> getAllPolls() {
        return pollRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Poll::getPostedDate).reversed())
                .map(this::getPollDTOInService)
                .collect(Collectors.toList());
    }

    public List<PollDTO> getMyPolls() {
        User user = jwtService.getLoggedInUser();
        if (user != null) {
            return pollRepository.findAllByUserId(user.getId())
                    .stream()
                    .sorted(Comparator.comparing(Poll::getPostedDate).reversed())
                    .map(this::getPollDTOInService)
                    .collect(Collectors.toList());
        }
        throw new EntityNotFoundException("User not found");
    }

    public void vote(Long pollId, Long optionId) {
        User user = jwtService.getLoggedInUser();

        if (user == null) {
            throw new EntityNotFoundException("User not found");
        }

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new EntityNotFoundException("Poll not found"));

        Options option = optionsRepository.findById(optionId)
                .orElseThrow(() -> new EntityNotFoundException("Option not found"));

        if (!option.getPoll().getId().equals(poll.getId())) {
            throw new IllegalArgumentException("Option does not belong to this poll");
        }

        if (poll.getExpiredAt() != null && poll.getExpiredAt().before(new Date())) {
            throw new IllegalArgumentException("Poll has expired");
        }

        boolean alreadyVoted = voteRepository.existsByPollIdAndUserId(
                poll.getId(),
                user.getId()
        );

        if (alreadyVoted) {
            throw new IllegalArgumentException("User has already voted in this poll");
        }

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setPoll(poll);
        vote.setOptions(option);

        voteRepository.save(vote);

        option.setVoteCount(option.getVoteCount() + 1);
        optionsRepository.save(option);

        poll.setTotalVoteCount(poll.getTotalVoteCount() + 1);
        pollRepository.save(poll);
    }
}
