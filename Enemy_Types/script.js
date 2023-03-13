/**
 * The DOMContentLoaded event fires when the HTML document
 * has been completely parsed, and all deferred scripts have downloaded and executed.
 * It doesn't wait for other things like stylesheets, images, subframes,
 * and async scripts to finish loading.
 *
 * load only fires when the whole page has been loaded including all dependent resources
 * such as stylesheets and images.
 * */
window.addEventListener('load', function ()
{
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 800;

    // wrapper class that contains and controls all movement and animation logic
    class Game
    {
        constructor(ctx, width, height)
        {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            this.enemies = []; // contains all enemies
            this.enemyInterval = 500;
            this.enemyTimer = 0;
            this.enemyTypes = ['worm', 'ghost', 'spider'];
        }
        update(deltaTime)
        {
            this.enemies = this.enemies.filter(object => !object.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval)
            {
                this.#addNewEnemy();
                this.enemyTimer = 0;
            }
            else
            {
                this.enemyTimer += deltaTime;
            }

            this.enemies.forEach(object => object.update(deltaTime));
        }
        draw()
        {
            this.enemies.forEach(object => object.draw(this.ctx));
        }
        #addNewEnemy() // # is private class method or field
        {
            const randomEnemy = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
            // 0.2 * 2 = 0.4,0.4 floor = 0, 0.7 * 2 = 1.4, floor = 1
            if (randomEnemy === 'worm')
                this.enemies.push(new Worm(this)); // passing in worm, is a type of enemy
            else if (randomEnemy === 'ghost')
                this.enemies.push(new Ghost(this));
            else if (randomEnemy === 'spider')
                this.enemies.push(new Spider(this));
            /** this.enemies.sort(function(a, b)
            {
                return a.y - b.y;
                // sort here is sorting by y-axis, the worms' y-axis bottom/higher value appear over
                // y-axis top/smaller value.
            });
            // Worm class does not have draw method, it will look for draw method in superclass
             */
        }
    }

    class Enemy
    {
        constructor(game) // passing the game because we are trying to pass in the ctx
        {
            this.game = game;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.maxFrame = 5;
            this.frameInterval = 100;
            this.frameTimer = 0;

        }
        update(deltaTime)
        {
            this.x -= this.vx * deltaTime;
            // remove enemies
            if (this.x < 0 - this.width) this.markedForDeletion = true;
            // any property is not appear in superclass, due to instantiate the subclass
            // it automatically carries all subclass property to superclass and
            // use subclass property in superclass when superclass does not obtain that property
            if (this.frameTimer > this.frameInterval)
            {
                if (this.frameX < this.maxFrame)
                    this.frameX++;
                else
                    this.frameX = 0;
                this.frameTimer = 0;
            }
            else
            {
                this.frameTimer += deltaTime;
            }
        }
        draw(ctx)
        {

            ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
                this.x, this.y, this.width, this.height);
        }
    }
    class Worm extends Enemy
    {
        constructor(game)
        {
            super(game); // super must use before this in subclass
            this.spriteWidth = 1374 / 6;
            this.spriteHeight = 171;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight / 2;
            this.x = this.game.width;
            this.y = this.game.height - this.height;
            this.image = worm;
            this.vx = Math.random() * 0.1 + 0.1;
        }
    }

    class Ghost extends Enemy
    {
        constructor(game)
        {
            super(game); // super must use before this in subclass
            this.spriteWidth = 1566 / 6;
            this.spriteHeight = 209;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight / 2;
            this.x = this.game.width;
            this.y = Math.random() * this.game.height * 0.8;
            this.image = ghost;
            this.vx = Math.random() * 0.2 + 0.1;
            this.angle = 0;
            this.curve = Math.random() * 3;
        }
        update(deltaTime)
        {
            super.update(deltaTime);
            this.y += Math.sin(this.angle) * this.curve;
            this.angle += 0.04;
        }
        draw(ctx)
        {
            ctx.save();
            ctx.globalAlpha = 0.7;
            /**
             * The CanvasRenderingContext2D.globalAlpha property of the
             * Canvas 2D API specifies the alpha (transparency) value
             * that is applied to shapes and images before they are drawn onto the canvas.
             * */
            super.draw(ctx);
            ctx.restore();
            // ctx.globalAlpha = 1;
            // after draw ghost, set back to one, because globalAlpha affects global
        }
    }

    class Spider extends Enemy
    {
        constructor(game)
        {
            super(game); // super must use before this in subclass
            this.spriteWidth = 1860 / 6;
            this.spriteHeight = 175;
            this.width = this.spriteWidth / 3;
            this.height = this.spriteHeight / 3;
            this.x = Math.random() * this.game.width;
            this.y = 0 - this.height;
            this.image = spider;
            this.vx = 0;
            this.vy = Math.random() * 0.1 + 0.1;
            this.maxLength = Math.random() * game.height;
        }
        update(deltaTime)
        {
            super.update(deltaTime);
            if (this.y < 0 - this.height * 2) this.markedForDeletion = true;
            this.y += this.vy * deltaTime;
            if (this.y > this.maxLength) this.vy *= -1;
        }
        draw(ctx)
        {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, 0);
            ctx.lineTo(this.x + this.width / 2, this.y + 10);
            ctx.stroke();
            super.draw(ctx);
        }
    }


    const game = new Game(ctx, canvas.width, canvas.height);
    let lastTime = 1;
    function animate(timestamp)
    {
        game.ctx.clearRect(0, 0, canvas.width, canvas.height);
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        game.update(deltaTime);
        game.draw();


        requestAnimationFrame(animate);
    }
    animate(0);
});
