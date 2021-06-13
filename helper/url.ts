export const getOriginfromUrl = (url:string) => {
    const urlInstant = new URL(url);
    return urlInstant.origin
}

export const isValidUrl = (str: string):boolean => {
    const expression = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return expression.test(str)
}
