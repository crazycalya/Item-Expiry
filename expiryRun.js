const playerCharacters = await game.actors.filter(a => a.type === "character");

let numExpired = 0;
let numActors = 0;
for (let a of playerCharacters) {
    const actorItems = await a.items.filter(item => item.flags.hasOwnProperty("itemExpiry"));

    numExpired += actorItems.length;
    if (actorItems.length !== 0) {
        numActors++

        let content = `
        <style>
        .expiryList {
            display: inline-flex;
            align-items: center;
          }
        </style>
    <div class="message-content">
        <div class="dnd5e chat-card item-card" data-actor-id="${a.id}" data-item-id="${actorItems[0].id}">
            <header class="card-header flexrow">
                <img src="${a.img}" width="36" height="36"></img>
                <h3 class="item-name">Items Expiring for ${a.name}</h3>
            </header>
            <div class="card-content">`;

        let expiring = 0;
        let expired = ``;
        for (let i of actorItems) {
            let num = parseInt(i.flags.itemExpiry.daysLeft);
            let name = i.flags.itemExpiry.nameOriginal;
            num--
            if (num > 0) {
                expiring++;
                await i.update({
                    "flags.itemExpiry.daysLeft": num,
                    "name": `${name} [Expires in ${num}]`
                });
                if (num > 1) {
                    content += `
                        <div>
                            <img src="${i.img}" width="32" height="32" style="vertical-align:middle"></img>
                            <span class="expiryList" >${name} - ${num} days remaining</span>
                        </div>`
                }
                if (num === 1) {
                    content += `
                        <div>
                            <img src="${i.img}" width="32" height="32" style="vertical-align:middle"></img>
                            <span class="expiryList">${name} - <b><i>${num} day remaining</b></i></span>
                        </div>`
                }
            }
            else {
                await i.delete();
                expired += `
                <div>
                    <img src="${i.img}" width="32" height="32" style="vertical-align:middle"></img>
                    <span class="expiryList" >${name} - Expired!</span>
                </div>`
            }
        }
        if (expiring < actorItems.length)
            content += `<hr>`

        content += expired;

        content += `      
    </div>
    </div>
    </div>`;

        await ChatMessage.create({
            user: game.user.id,
            content: content,
            speaker: ChatMessage.getSpeaker(),
        })
    }
};

if (numExpired === 0) {
    ui.notifications.warn("No items expired or expiring!")
}
else {
    ui.notifications.info(`${numExpired} expiring items updated on ${numActors} actors.`)
}
