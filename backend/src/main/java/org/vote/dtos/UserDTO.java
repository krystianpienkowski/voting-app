package org.vote.dtos;

import lombok.Data;
import org.vote.enums.UserRole;

@Data
public class UserDTO {
    private int id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole userRole;
}
