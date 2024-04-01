export interface MenuItem {
    id: string,
    name: string,
    title: string,
    url: string,
    contexts: string[],
    visible: boolean,
    openingMethod: string,
    width: number,
    height: number,
}