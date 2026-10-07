package com.bakery.cottage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAddressDTO {
    private String id;
    private String fullName;
    private String phoneNumber;
    private String addressLine;
    private String areaLocality;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private Boolean isDefault;
}
