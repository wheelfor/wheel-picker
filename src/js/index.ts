import { themes } from './themes';

import { z } from 'zod';

import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
extend([mixPlugin]);

export const WheelPickerOptionsSchema = z.object({
  // Core options
  choices: z.array(z.string()).nonempty(),
  theme: z.enum(Object.keys(themes) as [string, ...string[]]),
  minFontSize: z.number().default(10),
  maxFontSize: z.number().default(100),
  
  // Wheel appearance
  wheelColor: z.string().default('#f5f5f5'),
  textColor: z.string().default('#000000'),
  fontFamily: z.string().default('Arial Black, Arial, sans-serif'),
  fontWeight: z.string().default('normal'),
  
  // Pointer appearance
  pointerBorderColor: z.string().default('#000000'),
  pointerBorderWidth: z.number().default(3),
  pointerRadius: z.number().default(15),
  pointerBase: z.number().default(15),
  pointerHeight: z.number().default(5),
  
  // Spin behavior
  // randomFn: z.function({
  //   input: [],
  //   output: z.number(),
  // }),
  spinDuration: z.number().default(4000),
  spinJitter: z.number().default(0.02),
  
  // Result display
  showResult: z.boolean().default(true),
  resultBorderWidth: z.number().default(3),
  resultBorderColor: z.string().default('#000000'),
  resultTextColor: z.string().default('#000000'),
  resultFontFamily: z.string().default('Arial Black, Arial, sans-serif'),
  resultFontWeight: z.string().default('normal'),
  resultBoxHorizatalPaddingRatio: z.number().default(1.2),
  resultBoxVerticalPaddingRatio: z.number().default(1.4),
  resultBoxHeightRatio: z.number().default(0.3),
  resultBoxWidthRatio: z.number().default(1.6),
  resultTextOffset: z.number().default(0.5),
  resultBoxCornerRadius: z.number().default(5),
});

export type WheelPickerOptions = z.infer<typeof WheelPickerOptionsSchema>;

export type SpinEndEvent = CustomEvent<string>;

export class WheelPicker extends EventTarget {
  private options: WheelPickerOptions;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private center: number;
  private radius: number;

  private segments: string[] = [];
  private colors: string[] = [];

  private isSpinning = false;
  private isFinished = false;
  private winningIndex = 0;
  private rotation = 0;

  private pointerPath: Path2D;
  private randomFn: () => number;

  constructor(canvas: HTMLCanvasElement, options: Partial<WheelPickerOptions>) {
    super();

    this.canvas = canvas;
    this.options = WheelPickerOptionsSchema.parse(options);

    this.ctx = canvas.getContext('2d')!;
    this.center = canvas.width / 2;
    this.radius = this.center - 10;

    // fix random this.options.randomFn ??
    this.randomFn =  WheelPicker.defaultRandom;

    this.pointerPath = this.createPointer();

    this.updateChoices(this.options.choices);

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleClick);
  }

  public destroy() {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.handleClick);
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isHovering =
      this.pointerPath && this.ctx.isPointInPath(this.pointerPath, x, y);
    this.canvas.style.cursor = isHovering ? 'pointer' : 'default';
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.ctx.isPointInPath(this.pointerPath, x, y)) {
      this.spin();
    }
  }

  private font(size: number) {
    return `${this.options.fontWeight} ${size}px ${this.options.fontFamily}`;
  }

  private resultFont(size: number) {
    return `${this.options.resultFontWeight} ${size}px ${this.options.resultFontFamily}`;
  }

  private setTheme(theme: keyof typeof themes) {
    const base = themes[theme] || [];
    this.colors = this.segments.map((_, i) => base[i % base.length]);
    this.drawWheel();
  }

  public updateChoices(list: string[]) {
    this.segments = [...new Set(list.map((s) => s.trim()).filter(Boolean))];
    // @ts-ignore
    this.setTheme(this.options.theme);
    this.winningIndex = 0;
    this.isFinished = false;
    this.isSpinning = false;
    this.rotation = 0;
    this.drawWheel();
  }

  private fireSpinEnd(result: string): void {
    const event: SpinEndEvent = new CustomEvent('spinend', { detail: result });
    this.dispatchEvent(event);
  }

  private static defaultRandom(): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / 2 ** 32;
  }

  private createPointer(): Path2D {
    const r = this.options.pointerRadius;
    const triBase = this.options.pointerBase;
    const triHeight = this.options.pointerHeight;
    const cx = this.center;
    const cy = this.center;

    const angle1 = Math.asin(triBase / 2 / r);
    const angleTop = -Math.PI / 2;

    const path = new Path2D();
    path.arc(cx, cy, r, angleTop - angle1, angleTop + angle1, true);
    path.lineTo(cx, cy - r - triHeight);
    path.lineTo(
      cx + r * Math.cos(angleTop - angle1),
      cy + r * Math.sin(angleTop - angle1),
    );
    path.closePath();
    return path;
  }

  private drawWheel(angleOffset = this.rotation) {
    const { ctx, canvas, center, radius, segments } = this;
    const arc = (2 * Math.PI) / segments.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let fontSize = this.options.minFontSize;
    const arcAngle = (2 * Math.PI) / segments.length;
    const maxTextHeight = radius * arcAngle * 0.33;
    const maxTextWidth = radius * 0.8;

    for (let size = this.options.maxFontSize; size > this.options.minFontSize; size--) {
      ctx.font = this.font(size);
      const metrics = ctx.measureText('Mg');
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      
      const tooTall = textHeight > maxTextHeight;
      const tooWide = segments.some((txt) => ctx.measureText(txt).width > maxTextWidth);

      if (!tooWide && !tooTall) {
        fontSize = size;
        break;
      }
    }

    segments.forEach((label, i) => {
      const angle = i * arc + angleOffset;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, angle, angle + arc);
      ctx.fillStyle = colord(this.colors[i])
        .mix(colord(this.options.wheelColor), 0.5)
        .toRgbString();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.fillStyle = this.colors[i];
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      const textAngle = segments.length == 1 ? 0 : angle + arc / 2;
      ctx.rotate(textAngle);
      ctx.fillStyle = this.options.textColor;
      ctx.font = this.font(fontSize);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, radius * 0.6, 0);
      ctx.restore();
    });
    ctx.fillStyle = this.options.wheelColor;
    ctx.fill(this.pointerPath);

    ctx.lineWidth = this.options.pointerBorderWidth;
    ctx.strokeStyle = this.options.pointerBorderColor;
    ctx.stroke(this.pointerPath);

    if (this.options.showResult && this.isFinished) {
      ctx.save();    
      const winningLabel = this.segments[this.winningIndex]

      const maxTextHeight = radius * this.options.resultBoxHeightRatio / this.options.resultBoxVerticalPaddingRatio;
      const maxTextWidth = radius * this.options.resultBoxWidthRatio / this.options.resultBoxHorizatalPaddingRatio;
  
      let fontSize = this.options.minFontSize;
      for (let size = this.options.maxFontSize; size > this.options.minFontSize; size--) {
        ctx.font = this.resultFont(size);
        const metrics = ctx.measureText(winningLabel);
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        
        const tooTall = textHeight > maxTextHeight;
        const tooWide = metrics.width > maxTextWidth;
  
        if (!tooWide && !tooTall) {
          fontSize = size;
          break;
        }
      }

      ctx.font = this.resultFont(fontSize);
      const metrics = ctx.measureText(winningLabel);
      const textWidth = metrics.width;
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

      const boxWidth = textWidth * this.options.resultBoxHorizatalPaddingRatio;
      const boxHeight = textHeight * this.options.resultBoxVerticalPaddingRatio;

      const textOffset = radius * this.options.resultTextOffset;

      ctx.beginPath();
      ctx.roundRect(center - boxWidth / 2, center + textOffset - boxHeight / 2, boxWidth, boxHeight, this.options.resultBoxCornerRadius);
      ctx.fillStyle = this.colors[this.winningIndex];
      ctx.fill();
      ctx.strokeStyle = this.options.resultBorderColor;
      ctx.lineWidth = this.options.resultBorderWidth;
      ctx.stroke();

      ctx.fillStyle = this.options.resultTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(winningLabel, center, center + textOffset, textWidth);

      ctx.restore();
    }
  }

  public spin() {
    if (this.isSpinning || this.segments.length === 0) {
      return;
    }

    this.isSpinning = true;
    this.isFinished = false;

    const arc = (2 * Math.PI) / this.segments.length;
    this.winningIndex = Math.floor(this.randomFn() * this.segments.length);
    const sliceCenter =
    this.winningIndex * arc + arc / 2 + (this.randomFn() - 0.5) * arc * 0.5;
    const targetAngle = -Math.PI / 2 - sliceCenter + Math.PI * 2 * 5;
    const duration = this.options.spinDuration;
    const start = performance.now();
    const jitter = this.options.spinJitter;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = eased * targetAngle + Math.sin(eased * 30) * jitter;
      this.rotation = angle;
      this.drawWheel();
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
      else {
        this.isSpinning = false;
        this.isFinished = true;
        this.fireSpinEnd(this.segments[this.winningIndex]);
        this.drawWheel();
      }
    };

    requestAnimationFrame(animate);
  }
}

export { themes } from './themes';
