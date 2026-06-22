package org.vote.mappers;

import org.springframework.stereotype.Component;
import org.vote.dtos.UserDTO;
import org.vote.entities.User;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        UserDTO userDTO = new UserDTO();

        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setUserRole(user.getUserRole());

        return userDTO;
    }
}