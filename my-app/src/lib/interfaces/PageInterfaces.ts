export interface IPageSettings {
    onlyBluechips?: boolean;
    privacyMode?: boolean;
    prioritizeCurrency?: boolean;
}

export const initialPageSettings: IPageSettings = {
    onlyBluechips: false,
    privacyMode: false,
    prioritizeCurrency: false,
}