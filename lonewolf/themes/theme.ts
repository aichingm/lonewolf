import type { Ref } from "vue";
import type { GlobalThemeOverrides, ThemeCommonVars, CustomThemeCommonVars } from 'naive-ui'



const lightCommon = {
    fontWeightStrong: "500",
    fontWeight: "400",
    headerBadgeColor: "rgb(128, 128, 128)",
    listBadgeColor: "rgb(128, 128, 128)",
    listColor: "#e2e2e2",
    cardColor: "#ffffff",
    cardColorHover: "#efefef",
}

const darkCommon = {
    fontWeightStrong: "500",
    fontWeight: "400",
    headerBadgeColor: "rgb(128, 128, 128)",
    listBadgeColor: "rgb(128, 128, 128)",
    listColor: "rgb(44, 44, 50)",
    cardColor: "rgb(72, 72, 78)",
    cardColorHover: "rgb(52, 52, 58)",
}


type CommonExtra = typeof lightCommon;

export type ThemeCommon = ThemeCommonVars & CustomThemeCommonVars & CommonExtra

export type ThemeOverrides = GlobalThemeOverrides & {
    common?: Partial<ThemeCommonVars & CustomThemeCommonVars> & CommonExtra
}


export const themeOverridesLight: ThemeOverrides = {
    common: lightCommon
};

export const themeOverridesDark: ThemeOverrides = {
    common: darkCommon
};

export function themeCast(t: Ref<ThemeCommonVars & CustomThemeCommonVars>): Ref<ThemeCommon> {
    return (t as unknown) as Ref<ThemeCommon>
}

