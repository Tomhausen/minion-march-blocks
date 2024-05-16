namespace SpriteKind {
    export const Collider = SpriteKind.create()
    export const Jump = SpriteKind.create()
    export const Portal = SpriteKind.create()
}
function reset_platform () {
    if (platforms_to_reset.length < 1) {
        return
    }
    location = platforms_to_reset.shift()
    tiles.setTileAt(location, myTiles.transparency16)
    tiles.setWallAt(location, false)
    music.play(music.melodyPlayable(music.knock), music.PlaybackMode.InBackground)
    platforms_available += -1
}
function reset_level () {
    if (!(spawning_phase)) {
        for (let location of tiles.getTilesByType(myTiles.tile6)) {
            tiles.setTileAt(location, myTiles.transparency16)
            tiles.setWallAt(location, false)
        }
        platforms_available += 3
        escaped_minions = 0
        sprites.destroyAllSpritesOfKind(SpriteKind.Player)
        sprites.destroyAllSpritesOfKind(SpriteKind.Jump)
        sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
        reset_portals()
        tiles.setCurrentTilemap(levels[level])
        music.beamUp.play()
        timer.background(function () {
            spawn_minions()
        })
    }
}
function update_platform_counter () {
    platform_counter = textsprite.create("" + platforms_available + " platforms")
    platform_counter.left = 0
    platform_counter.bottom = 120
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    reset_level()
})
browserEvents.MouseWheel.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x, y) {
    collider_sprite = sprites.create(image.create(5, 5), SpriteKind.Collider)
    collider_sprite.setPosition(cursor.x, cursor.y)
    collider_sprite.image.fill(2)
    collider_sprite.setFlag(SpriteFlag.Invisible, true)
    collider_sprite.lifespan = 500
})
browserEvents.MouseLeft.onEvent(browserEvents.MouseButtonEvent.Pressed, function (x, y) {
    place(x, y)
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Jump, function (sprite, otherSprite) {
    sprite.vy = sprites.readDataNumber(otherSprite, "jump_strength")
})
scene.onOverlapTile(SpriteKind.Player, myTiles.tile5, function (minion, location) {
    minion.destroy()
})
function camera_movement () {
    camera_x = scene.cameraProperty(CameraProperty.X)
    camera_y = scene.cameraProperty(CameraProperty.Y)
    if (browserEvents.getMouseCameraX() < 15) {
        scene.centerCameraAt(camera_x - 1, camera_y)
    } else if (browserEvents.getMouseCameraX() > 145) {
        scene.centerCameraAt(camera_x + 1, camera_y)
    }
    if (browserEvents.getMouseCameraY() < 15) {
        scene.centerCameraAt(camera_x, camera_y - 1)
    } else if (browserEvents.getMouseCameraY() > 105) {
        scene.centerCameraAt(camera_x, camera_y + 1)
    }
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (tiles.tileAtLocationEquals(cursor.tilemapLocation(), myTiles.transparency16)) {
        pad = sprites.create(assets.image`jump pad light`, SpriteKind.Jump)
        sprites.setDataNumber(pad, "jump_strength", -75)
        tiles.placeOnTile(pad, cursor.tilemapLocation())
    }
})
function mouse_behaviour () {
    cursor.x = browserEvents.getMouseSceneX()
    cursor.y = browserEvents.getMouseSceneY()
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.Portal, function (sprite, otherSprite) {
    if (!(sprites.readDataBoolean(sprite, "recently teleported"))) {
        if (sprites.readDataBoolean(blue_portal, "active") && sprites.readDataBoolean(orange_portal, "active")) {
            if (sprite == blue_portal) {
                portal_to_place = orange_portal
            } else {
                portal_to_place = blue_portal
            }
            sprites.setDataBoolean(sprite, "recently teleported", true)
            pause(1000)
            sprites.setDataBoolean(sprite, "recently teleported", false)
        }
    }
})
sprites.onOverlap(SpriteKind.Collider, SpriteKind.Jump, function (sprite, otherSprite) {
    if (otherSprite.image.equals(assets.image`jump pad light`)) {
        otherSprite.setImage(assets.image`jump pad strong`)
        sprites.setDataNumber(pad, "jump_strength", -150)
    } else {
        otherSprite.setImage(assets.image`jump pad light`)
        sprites.setDataNumber(pad, "jump_strength", -75)
    }
})
function next_level () {
    info.changeScoreBy(escaped_minions * 10)
    level += 1
    reset_level()
}
function setup_platform_counter () {
    platforms_available = 0
    platform_counter = textsprite.create("")
    platform_counter.setFlag(SpriteFlag.RelativeToCamera, true)
}
scene.onOverlapTile(SpriteKind.Player, myTiles.tile8, function (sprite, location) {
    sprites.destroy(sprite)
})
function place (x: number, y: number) {
    if (platforms_available < 1) {
        return
    }
    if (tiles.tileAtLocationEquals(cursor.tilemapLocation(), myTiles.transparency16)) {
        platforms_available += -1
        update_platform_counter()
        tiles.setTileAt(cursor.tilemapLocation(), myTiles.tile6)
        tiles.setWallAt(cursor.tilemapLocation(), true)
        platforms_to_reset.push(cursor.tilemapLocation())
        timer.after(8000, function () {
            reset_platform()
        })
    }
}
scene.onOverlapTile(SpriteKind.Player, myTiles.tile4, function (minion, location) {
    escaped_minions += 1
    minion.destroy()
})
sprites.onOverlap(SpriteKind.Collider, SpriteKind.Enemy, function (sprite, otherSprite) {
    info.changeScoreBy(10)
    sprites.destroy(otherSprite)
})
browserEvents.T.onEvent(browserEvents.KeyEvent.Pressed, function () {
    cursor_location = cursor.tilemapLocation()
    if (!(tiles.tileAtLocationIsWall(cursor_location))) {
        tiles.placeOnTile(portal_to_place, cursor_location)
        sprites.setDataBoolean(portal_to_place, "active", true)
        if (portal_to_place == blue_portal) {
            portal_to_place = orange_portal
        } else {
            portal_to_place = blue_portal
        }
    }
})
function spawn_minions () {
    spawning_phase = true
    pause(1250)
    for (let index = 0; index < wave_size; index++) {
        pause(750)
        minion = sprites.create(assets.image`minion`, SpriteKind.Player)
        tiles.placeOnRandomTile(minion, myTiles.tile3)
        minion.vx = speed
        minion.ay = 120
        characterAnimations.loopFrames(
        minion,
        assets.animation`walk right`,
        100,
        characterAnimations.rule(Predicate.MovingRight)
        )
        characterAnimations.loopFrames(
        minion,
        assets.animation`walk left`,
        100,
        characterAnimations.rule(Predicate.MovingLeft)
        )
    }
    music.powerUp.play()
    spawning_phase = false
}
sprites.onDestroyed(SpriteKind.Player, function (sprite) {
    if (sprites.allOfKind(SpriteKind.Player).length < 1) {
        if (escaped_minions > 3) {
            if (level > levels.length - 1) {
                game.over(true)
            } else {
                next_level()
            }
        } else {
            reset_level()
        }
    }
})
function reset_portals () {
    blue_portal.setPosition(-10, -10)
    orange_portal.setPosition(-10, -10)
    sprites.setDataBoolean(blue_portal, "active", false)
    sprites.setDataBoolean(orange_portal, "active", false)
}
sprites.onOverlap(SpriteKind.Collider, SpriteKind.Player, function (sprite, otherSprite) {
    if (!(sprites.readDataBoolean(otherSprite, "stunned"))) {
        sprites.setDataBoolean(otherSprite, "stunned", true)
        old_vx = minion.vx
        minion.vx = 0
        minion.sayText("!", 2000, false)
        sprites.destroy(sprite)
        pause(2000)
        minion.vx = old_vx
        sprites.setDataBoolean(otherSprite, "stunned", false)
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprites.destroy(sprite)
    sprites.destroy(otherSprite)
})
let target: Sprite = null
let bat: tilesAdvanced.PathfinderSprite = null
let old_vx = 0
let minion: Sprite = null
let cursor_location: tiles.Location = null
let pad: Sprite = null
let camera_y = 0
let camera_x = 0
let collider_sprite: Sprite = null
let platform_counter: TextSprite = null
let escaped_minions = 0
let spawning_phase = false
let platforms_available = 0
let location: tiles.Location = null
let portal_to_place: Sprite = null
let orange_portal: Sprite = null
let blue_portal: Sprite = null
let cursor: Sprite = null
let speed = 0
let wave_size = 0
let level = 0
let platforms_to_reset: tiles.Location[] = []
let levels: tiles.TileMapData[] = []
levels = [
tilemap`level 1`,
tilemap`level 2`,
tilemap`level 3`,
tilemap`level 4`,
tilemap`level 5`
]
platforms_to_reset = []
level = -1
wave_size = 14
speed = 20
let traps_active = false
cursor = sprites.create(image.create(2, 2), 0)
blue_portal = sprites.create(assets.image`blue portal`, SpriteKind.Portal)
orange_portal = sprites.create(assets.image`orange portal`, SpriteKind.Portal)
portal_to_place = blue_portal
next_level()
setup_platform_counter()
update_platform_counter()
game.onUpdate(function () {
    timer.background(function () {
        for (let value of tiles.getTilesByType(myTiles.tile9)) {
            tiles.setTileAt(value, myTiles.tile8)
        }
        pause(2000)
        for (let value of tiles.getTilesByType(myTiles.tile8)) {
            tiles.setTileAt(value, myTiles.tile9)
        }
        pause(6000)
    })
})
game.onUpdate(function () {
    for (let value of sprites.allOfKind(SpriteKind.Player)) {
        if (value.isHittingTile(CollisionDirection.Left)) {
            value.vx = speed
        } else if (value.isHittingTile(CollisionDirection.Right)) {
            value.vx = speed * -1
        }
    }
})
game.onUpdate(function () {
    mouse_behaviour()
    camera_movement()
})
game.onUpdateInterval(10000, function () {
    if (sprites.allOfKind(SpriteKind.Player).length < 1) {
        bat = tilesAdvanced.createPathfinderSprite(assets.image`bat`, SpriteKind.Enemy)
        animation.runImageAnimation(
        bat,
        assets.animation`bat flight`,
        50,
        false
        )
        tiles.placeOnTile(bat, tiles.getTileLocation(randint(0, tilesAdvanced.getTilemapWidth()), 0))
        target = sprites.allOfKind(SpriteKind.Enemy)._pickRandom()
        tilesAdvanced.followUsingPathfinding(bat, target)
    }
})
