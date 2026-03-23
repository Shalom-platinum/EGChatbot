export interface IEligibilityMatrix {
    customerEmail: string
    isBCResident: boolean
    isCAPRResident: boolean
    unEmployedOrPE: boolean
    assistToAdvCareer: boolean
    seekingEmployment: boolean
    seekingSelfEmployment: boolean
    requireService: boolean
    isDisabilibilty: boolean
    isBtw16To29: boolean
    isPastAbuse: boolean
    isMultiplebarrier: boolean
    isEligibileForCLBC: boolean
    isReferredByCLBC: boolean
    isAge19: boolean
}

export interface IEligibilityMatrixResponse{
    status:boolean
}

export interface IGetServiceLocationResponse {
    id: number
    address: string
}

export interface ISetServiceLocationRequest {
    officeAddress: string
    customerAddress: string
    customerEmail: string
}

export interface ICreateCustomerRequest {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
}
