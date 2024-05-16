namespace SpriteKind {
    export const Collider = SpriteKind.create()
    export const Jump = SpriteKind.create()
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
function place (x: number, y: number) {
    if (platforms_available < 1) {
        return
    }
    if (tiles.tileAtLocationEquals(cursor.tilemapLocation(), myTiles.transparency16)) {
        platforms_available += -1
        update_platform_counter()
        tiles.setTileAt(cursor.tilemapLocation(), myTiles.tile6)
        tiles.setWallAt(cursor.tilemapLocation(), true)
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
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprites.destroy(sprite)
    sprites.destroy(otherSprite)
})
let target: Sprite = null
let bat: tilesAdvanced.PathfinderSprite = null
let minion: Sprite = null
let pad: Sprite = null
let camera_y = 0
let camera_x = 0
let collider_sprite: Sprite = null
let platform_counter: TextSprite = null
let escaped_minions = 0
let platforms_available = 0
let spawning_phase = false
let cursor: Sprite = null
let speed = 0
let wave_size = 0
let level = 0
let levels: tiles.TileMapData[] = []
levels = [
tilemap`level 1`,
tilemap`level 2`,
tilemap`level 3`,
tilemap`level 4`,
tilemap`level 5`
]
level = -1
wave_size = 14
speed = 20
cursor = sprites.create(image.create(2, 2), 0)
next_level()
setup_platform_counter()
update_platform_counter()
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
