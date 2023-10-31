import { CircleObject } from "../collision-objects/circle-object";
import { ItemType } from "../enums/item-type";
import { getWeaponSprite } from "../enums/weapon-type";
import { GameVars, toPixelSize } from "../game-variables";
import { genSmallBox } from "../utilities/box-generator";
import { circleToCircleCollision } from "../utilities/collision-utilities";
import { createElem, drawSprite, setElemSize } from "../utilities/draw-utilities";
import { heart, key } from "./sprites";

export class Item {
    constructor(x, y, itemType, subType, room) {
        this.room = room;
        this.wasPicked = false;
        this.x = x;
        this.y = y;
        this.itemType = itemType;
        this.subType = subType;
        this.sprite = this.getSprite(itemType, subType);

        this.timeElapsed = 0;

        this.itemDiv = createElem(room.roomDiv, "div", null, ["item"]);
        this.shadowCanv = createElem(this.itemDiv, "canvas");
        this.itemCanv = createElem(this.itemDiv, "canvas");

        this.init(x, y)
    }

    init(x, y) {
        this.x = x;
        this.y = y;

        this.size = toPixelSize(this.itemType === ItemType.HEART ? 1 : 2);

        this.collisionObj = new CircleObject(
            x + (this.sprite[0].length * this.size / 2),
            y + (this.sprite.length * this.size / 2),
            (this.sprite[0].length > this.sprite.length ? this.sprite[0].length : this.sprite.length) * this.size);
        this.fakeMovCircle = new CircleObject(this.collisionObj.x, this.collisionObj.y, this.collisionObj.r);


        this.itemDiv.style.translate = this.x + 'px ' + this.y + 'px';

        let shadowSize = toPixelSize(2) * (5);
        setElemSize(this.shadowCanv, shadowSize, shadowSize);
        this.shadowCanv.style.translate = -this.size + 'px ' + ((this.size * this.sprite.length) - (shadowSize / 2)) + 'px';

        setElemSize(this.itemCanv, this.sprite[0].length * this.size, this.sprite.length * this.size)

        this.draw();
    }

    getSprite(itemType, subType) {
        switch (itemType) {
            case ItemType.KEY:
                return key;
            case ItemType.HEART:
                return heart;
        }
        return getWeaponSprite(subType);
    }

    update() {
        if (this.timeElapsed / 1 >= 1) {
            if (circleToCircleCollision(GameVars.player.collisionObj, this.collisionObj)) {
                switch (this.itemType) {
                    case ItemType.KEY:
                        GameVars.keyCaught++;
                        GameVars.player.hasKey = true;
                        this.wasPicked = true;
                        break;
                    case ItemType.HEART:
                        if (GameVars.player.lifeBar.life !== GameVars.player.lifeBar.totalLife) {
                            GameVars.player.lifeBar.addLife();
                            this.wasPicked = true;
                        }
                        break;
                    case ItemType.WEAPON:
                        if (!this.wasPicked && (GameVars.keys['v'] || GameVars.keys['B'])) {
                            this.wasPicked = true;
                            GameVars.player.pickWeapon(this.x, this.y, this.subType, -1);
                            GameVars.weaponIcons.update();
                        }
                        if (!this.wasPicked && (GameVars.keys['b'] || GameVars.keys['B'])) {
                            this.wasPicked = true;
                            GameVars.player.pickWeapon(this.x, this.y, this.subType, 1);
                            GameVars.weaponIcons.update();
                        }
                        break;
                }
                if (this.wasPicked) {
                    GameVars.sound.pickItem();
                    this.destroy();
                }
            }
        } else {
            this.timeElapsed += GameVars.deltaTime;
        }
    }

    validateMovement(x, y) {
        this.collisionObj.x = x;
        this.collisionObj.y = y;
        this.itemDiv.style.translate = (this.collisionObj.x - (this.sprite[0].length * this.size) / 2) + 'px ' +
            (this.collisionObj.y - (this.sprite.length * this.size) / 2) + 'px';
    }

    destroy() {
        this.room.items.splice(this.room.items.indexOf(this), 1);
        this.itemDiv.remove();
    }

    draw() {
        genSmallBox(this.shadowCanv, 0, 0, 4, 4, toPixelSize(2), "#00000033", "#00000033");
        drawSprite(this.itemCanv, this.sprite, this.size, null, null, this.itemType === ItemType.HEART ? { "ho": "#edeef7", "hi": "#a80000" } : { "wc": "#cd9722" });
    }
}