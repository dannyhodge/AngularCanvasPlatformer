import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ObjectPosition } from 'src/models/objectPosition';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, AfterViewInit, OnChanges {
  groundHeight: number = 350;
  characterHeight: number = 60;
  currentPositionX: number = window.innerWidth / 3;
  currentPositionY: number = this.groundHeight - this.characterHeight;

  isGrounded: boolean = true;
  actingGravity: number = 0;
  maxGravity: number = 25;
  maxJump: number = 10;

  currentObjects: ObjectPosition[] = [];

  randomObjectSpawnTime: number = 200;
  obstacleInterval: any;

  @ViewChild('myCanvas', { static: true }) myCanvas: ElementRef | undefined;

  ctx: CanvasRenderingContext2D | undefined;

  ngAfterViewInit(): void {
    if (this.myCanvas == null) {
      console.log('canvas null');
    }

    this.ctx = this.myCanvas?.nativeElement.getContext('2d');

    if (this.ctx != null) {
      this.drawAll(this.ctx);
    } else {
      console.log('context null');
    }

    setInterval(() => {
      this.gravity();
      this.moveMap();
      this.ctx ? this.drawAll(this.ctx) : null;
    }, 50);

    this.createNewObstacle();
    
    this.setObstacleInterval();
  }

  setObstacleInterval(): void {
    console.log("here");
    this.obstacleInterval = setInterval(() => {
      this.createNewObstacle();
    }, this.randomObjectSpawnTime);
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.ctx != null) {
      this.drawAll(this.ctx);
    }
  }
  @HostListener('window:resize', ['$event'])
  resizeCanvas(event: any): void {
    console.log('Resize');
    if (this.ctx != null) {
      this.ctx.canvas.width = window.innerWidth;
      this.drawAll(this.ctx);
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (event.key == ' ') {
      this.jump();
    }

    if (this.ctx != null) {
      this.drawAll(this.ctx);
    }
  }

  drawAll(ctx: CanvasRenderingContext2D): void {
    ctx.canvas.width = window.innerWidth;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    this.drawGround(ctx);
    this.drawCharacter(ctx);
    this.drawObstacles(ctx);
  }

  drawGround(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.moveTo(0, 350);
    ctx.lineTo(window.innerWidth, 350);
  }

  drawCharacter(ctx: CanvasRenderingContext2D): void {
    ctx.rect(this.currentPositionX, this.currentPositionY, 30, 60);
    ctx.stroke();
  }

  drawObstacles(ctx: CanvasRenderingContext2D): void {
    this.currentObjects.forEach((object: ObjectPosition) => {
      ctx.rect(object.xPos, object.yPos, 30, 30);
      ctx.stroke();
    });
  }

  jump(): void {
    var jumpInterval: any = null;
    if (this.currentPositionY === this.groundHeight - this.characterHeight) {
      if (this.isGrounded == true) {
        jumpInterval = setInterval(() => {
          this.jumpAnim();
        }, 50);
        setTimeout(() => {
          clearInterval(jumpInterval);
        }, 500);
      }
    }
  }

  jumpAnim(): void {
    this.currentPositionY -= 15;
  }

  gravity(): void {
    var distToGround: number =
      this.groundHeight - this.currentPositionY - this.characterHeight;

    var gravityToUse: number = 0;

    if (distToGround < this.actingGravity) {
      gravityToUse = distToGround;
    } else {
      gravityToUse = this.actingGravity;
    }

    if (this.currentPositionY < this.groundHeight - this.characterHeight) {
      if (this.actingGravity < this.maxGravity) {
        this.actingGravity += 3;
      }
      this.isGrounded = false;

      this.currentPositionY += gravityToUse;

      if (this.ctx != null) {
        this.drawAll(this.ctx);
      }
    } else {
      this.isGrounded = true;
      this.actingGravity = 0;
    }
  }

  moveMap(): void {
    this.currentObjects.forEach((object: ObjectPosition) => {
      object.xPos -= 10;
    });
    if(this.currentObjects[0].xPos <= 0) 
    {
      this.currentObjects = this.currentObjects.slice(1);
    }
  }

  createNewObstacle(): void {
    
    var newObstacle: ObjectPosition = {
      xPos: window.innerWidth,
      yPos: this.groundHeight - 30,
    };
    this.currentObjects.push(newObstacle);
    
    this.randomObjectSpawnTime = (Math.random() * 2500) + 500;
    clearInterval(this.obstacleInterval);
    this.setObstacleInterval();
  }
}
