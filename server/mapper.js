/**
 * MUST BE IN SYNC WITH:
 * - vue build's sourceChoices
 * - react site's KeyboardId enum
 */

const getBoard = (sourceId) => {
    // all the IDs map to a board dir in /board-config
    switch (sourceId) {
        case "bt60v1_hotswap":
        case "bt60v1_ansi":
        case "bt60v1_iso":
        case "bt60v1_tsangan":
        case "bt60v1_1u":
            return 'bt60'
        case "bt60v2_ansi":
        case "bt60v2_iso":
        case "bt60v2_tsangan":
        case "bt60v2_1u":
            return "bt60"
        case "bt65v1_ansi":
        case "bt65v1_iso":
        case "bt65v1_tsangan":
        case "bt65v1_1u":
            return "bt65"
        case "bt75v1_ansi":
        case "bt75v1_iso":
        // case "bt75v1_tsangan": // no support
        case "bt75v1_1u":
            return "bt75"
        default:
            return null // if this function returns null, the id is not valid
    }
}


module.exports = {
    getBoard
}