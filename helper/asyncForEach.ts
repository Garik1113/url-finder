export const asyncForEach = async(items: any[], cb:(item:any) => any) => {
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        await cb(item)
    }
}
