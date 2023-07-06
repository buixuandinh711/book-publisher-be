export type PaymentMethod = "COD" | "MOMO";

export interface Province {
    name: string;
    id: number;
}

export interface District {
    name: string;
    id: number;
}

export interface Ward {
    name: string;
    code: string;
}

export interface GHNResponseData {
    code: number;
    message: "Success" | string;
    data?: unknown;
}

export interface PreviewInfo {
    shippingFee: number;
    shippingTime: string;
}
