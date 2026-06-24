import axiosInstance from "../api/axiosInstance";

export const postPoll = async (pollDTO) => {
  const response = await axiosInstance.post('/api/user/poll', pollDTO);
  return response.data;
};

export const getAllPolls = async () => {
  const response = await axiosInstance.get('/api/user/polls');
  return response.data;
};

export const getMyPolls = async () => {
  const response = await axiosInstance.get('/api/user/my-polls');
  return response.data;
};

export const deletePollById = async (id) => {
  const response = await axiosInstance.delete(`/api/user/poll/${id}`);
  return response.data;
};

export const votePoll = async (pollId, optionId) => {
    return await axiosInstance.post(`/api/user/poll/${pollId}/vote`, {
        optionId,
    });
    return response.data;
};