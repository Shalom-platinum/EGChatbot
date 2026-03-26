export interface AgentMetaResponse {

    name: string;
    description: string;
    logo: null
}

export interface AgentCreateSession{
    
    name: string;
    email: string;
    phone: string;

}


export interface AgentNewSessionResponse{
    
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: string;

}