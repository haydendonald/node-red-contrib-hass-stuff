export function generateRandomId(checks?: string[]) {
    let id;
    while (id === undefined || (checks && checks.includes(id))) {
        id = Math.random().toString(36).substring(2, 15);
    }
    return id;
}

export function cleanEntityId(entityId: string) {
    return entityId.toLowerCase().replace(" - ", "_").replace(/\s/g, "_").replace(/[\W]+/g, "")
}

export function getEntityId(scope: string, friendlyName: string) {
    return `${scope}.${cleanEntityId(friendlyName)}`;
}