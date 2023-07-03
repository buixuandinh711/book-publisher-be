export const BOOK_WEIGHT = 300;
export const BOOK_LENGTH = 25;
export const BOOK_WIDTH = 20;
export const BOOK_HEIGHT = 2;
export const GHN_SERVICE_TYPE = 2; // standard
export const GHN_REQUIRED_NOTE = "KHONGCHOXEMHANG";

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

export const createPreviewBody = (toDistrictId: string, toWardCode: string, quantity: number) => {
    const data = {
        payment_type_id: 2,
        required_note: GHN_REQUIRED_NOTE,
        to_name: "Test User",
        to_phone: "0971443356",
        to_address: "Lang Test",
        to_ward_code: toWardCode,
        to_district_id: toDistrictId,
        weight: quantity * BOOK_WEIGHT,
        length: BOOK_LENGTH,
        width: BOOK_WIDTH,
        height: quantity * BOOK_HEIGHT,
        service_type_id: GHN_SERVICE_TYPE,
        items: [
            {
                name: "Sách",
                quantity: quantity,
                weight: quantity * BOOK_WEIGHT,
            },
        ],
    };
    return JSON.stringify(data);
};

export const createOrderBody = (
    name: string,
    phone: string,
    address: string,
    payment: PaymentMethod,
    toDistrictId: string,
    toWardCode: string,
    quantity: number,
    note = ""
) => {
    const data = {
        payment_type_id: payment === "COD" ? 2 : 1,
        required_note: GHN_REQUIRED_NOTE,
        to_name: name,
        to_phone: phone,
        to_address: address,
        to_ward_code: toWardCode,
        to_district_id: toDistrictId,
        weight: quantity * BOOK_WEIGHT,
        length: BOOK_LENGTH,
        width: BOOK_WIDTH,
        height: quantity * BOOK_HEIGHT,
        service_type_id: GHN_SERVICE_TYPE,
        note: note,
        items: [
            {
                name: "Book",
                quantity: quantity,
                weight: quantity * BOOK_WEIGHT,
            },
        ],
    };
    return JSON.stringify(data);
};
