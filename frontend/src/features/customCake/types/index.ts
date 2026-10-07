export type CakeCategoryType =
  | 'Birthday Cake'
  | 'Anniversary Cake'
  | 'Wedding Cake'
  | 'Theme Cake'
  | 'Celebration Cake'
  | 'Other'

export type CakeFlavorType =
  | 'Chocolate Truffle'
  | 'Dutch Dark Chocolate'
  | 'Vanilla Bean'
  | 'Red Velvet'
  | 'Butterscotch Caramel'
  | 'Fresh Strawberry'
  | 'Black Forest'
  | 'Other / Custom Blend'

export type CakeWeightType =
  | '0.5 kg'
  | '1.0 kg'
  | '1.5 kg'
  | '2.0 kg'
  | '2.5 kg'
  | '3.0 kg'
  | 'Custom / Multi-Tier'

export type DietaryPreference = 'Eggless' | 'With Egg'

export type DeliveryTimeWindow =
  | 'Morning (10:00 AM – 01:00 PM)'
  | 'Afternoon (01:00 PM – 05:00 PM)'
  | 'Evening (05:00 PM – 08:00 PM)'

export type CustomCakeStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'CONVERTED_TO_ORDER'
  | 'CANCELLED'

export interface CustomCakePayload {
  cakeType: CakeCategoryType
  flavor: CakeFlavorType
  weight: CakeWeightType
  dietaryPreference: DietaryPreference
  customMessage?: string
  specialInstructions?: string
  referenceImage: File
  preferredDeliveryDate: string
  preferredDeliveryTime: DeliveryTimeWindow
}

export interface CustomCakeRequest {
  id: string
  userId: string
  cakeType: CakeCategoryType
  flavor: CakeFlavorType
  weight: CakeWeightType
  dietaryPreference: DietaryPreference
  customMessage?: string
  specialInstructions?: string
  referenceImageUrl: string
  referenceImageName: string
  referenceImageSize: number
  preferredDeliveryDate: string
  preferredDeliveryTime: DeliveryTimeWindow
  status: CustomCakeStatus
  estimatedPrice?: number
  confirmedPrice?: number
  bakeryNotes?: string
  createdAt: string
  updatedAt: string
}
