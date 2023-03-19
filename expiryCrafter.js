let allItems = [];
let rowCounter = 0;

async function addRow(item, source) {
    rowCounter++;
    let itemSource = source ? source : "World";
    let name = item.flags.hasOwnProperty("itemExpiry") ? item.flags.itemExpiry.nameOriginal : item.name;

    const rowHtml = `
        <div id="row-${rowCounter}">
            <table><tr>
                <td><img src="${item.img}" width="32" height="32" style="vertical-align:middle"></img></td>
                <td><b>Item:</b> ${name}</td>
                <td><b>Source:</b> ${itemSource}</td>
            </tr></table>
        </div>`;
    $('#extraRows').append(rowHtml);
}

class ItemExpirer extends Dialog {
    constructor() {
        super({
            title: "Item Expirer",
            content: `
                <form>
                    <div class="form-group">
                        <label>Days to expire:</label>
                        <div class="form-fields">
                            <input type="number" id="expiry" value="1" min="1">
                        </div>
                    </div>
                    <hr>
                    <p class="notification info" id="dragInfo">Drag and drop items to set expiry dates.</p>
                    <div id="extraRows"></div>
                </form>`
            ,
            buttons: {
                ok: {
                    icon: "<i class='fas fa-check'></i>",
                    label: "Set Expiry",
                    callback: async (html) => {
                        const num = html.find("#expiry").val();
                        const len = allItems.length;
                        for (let i = 0; i < len; i++) {
                            let name = allItems[i].flags.hasOwnProperty("itemExpiry") ? allItems[i].flags.itemExpiry.nameOriginal : allItems[i].name;
                            await allItems[i].update({ "flags.itemExpiry": { daysLeft: num, nameOriginal: name }, "name": `${name} [Expires in ${num}]` })
                        }
                    },
                    height: "content"
                },
                cancel: {
                    icon: "<i class='fas fa-times'></i>",
                    label: "Cancel",
                    callback: () => { },
                    height: "content"
                },
            },
            default: "cancel",
        },
            {
                width: 400,
                height: "content",
            });
    }

    activateListeners(html) {


        // Add listener to form for dragging and dropping items
        html.find("form").on('drop', async (event) => {
            event.preventDefault();
            const droppedItem = JSON.parse(event.originalEvent.dataTransfer.getData("text/plain"));
            const uuidArray = droppedItem.uuid.split(".").filter(str => str.length > 0);
            let item;
            if (uuidArray[0] === "Item") {
                item = await game.items.get(uuidArray[1]);
                addRow(item);
            }
            if (uuidArray[0] === "Actor" && uuidArray[2] === "Item") {
                let actor = await game.actors.get(uuidArray[1]);
                item = await actor.items.get(uuidArray[3]);
                addRow(item, actor.name);
            }
            allItems.push(item);
        });

        // Call the parent class's activateListeners method to include the original button behaviors
        super.activateListeners(html);
    }
}

let dialogCrafter = new ItemExpirer().render(true);
