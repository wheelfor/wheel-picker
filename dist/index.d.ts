import { z } from 'zod';

declare const themes: {
    "Fresh Air": string[];
    Popcorn: string[];
    Playground: string[];
    Sprinkles: string[];
    Chalkboard: string[];
    "Buddy System": string[];
    "Garden Party": string[];
    Marshmallow: string[];
};

declare const WheelPickerOptionsSchema: z.ZodObject<{
    choices: z.ZodArray<z.ZodString>;
    theme: z.ZodEnum<{
        [x: string]: string;
    }>;
    minFontSize: z.ZodDefault<z.ZodNumber>;
    maxFontSize: z.ZodDefault<z.ZodNumber>;
    wheelColor: z.ZodDefault<z.ZodString>;
    textColor: z.ZodDefault<z.ZodString>;
    fontFamily: z.ZodDefault<z.ZodString>;
    fontWeight: z.ZodDefault<z.ZodString>;
    pointerBorderColor: z.ZodDefault<z.ZodString>;
    pointerBorderWidth: z.ZodDefault<z.ZodNumber>;
    pointerRadius: z.ZodDefault<z.ZodNumber>;
    pointerBase: z.ZodDefault<z.ZodNumber>;
    pointerHeight: z.ZodDefault<z.ZodNumber>;
    spinDuration: z.ZodDefault<z.ZodNumber>;
    spinJitter: z.ZodDefault<z.ZodNumber>;
    interactive: z.ZodDefault<z.ZodBoolean>;
    showResult: z.ZodDefault<z.ZodBoolean>;
    resultBorderWidth: z.ZodDefault<z.ZodNumber>;
    resultBorderColor: z.ZodDefault<z.ZodString>;
    resultTextColor: z.ZodDefault<z.ZodString>;
    resultFontFamily: z.ZodDefault<z.ZodString>;
    resultFontWeight: z.ZodDefault<z.ZodString>;
    resultBoxHorizatalPaddingRatio: z.ZodDefault<z.ZodNumber>;
    resultBoxVerticalPaddingRatio: z.ZodDefault<z.ZodNumber>;
    resultBoxHeightRatio: z.ZodDefault<z.ZodNumber>;
    resultBoxWidthRatio: z.ZodDefault<z.ZodNumber>;
    resultTextOffset: z.ZodDefault<z.ZodNumber>;
    resultBoxCornerRadius: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
type WheelPickerOptions = z.infer<typeof WheelPickerOptionsSchema>;
type SpinEndEvent = CustomEvent<{
    result: string;
    index: number;
    angle: number;
}>;
declare class WheelPicker extends EventTarget {
    private options;
    private canvas;
    private ctx;
    private center;
    private radius;
    private segments;
    private colors;
    private isSpinning;
    private isFinished;
    private winningIndex;
    private rotation;
    private pointerPath;
    private randomFn;
    constructor(canvas: HTMLCanvasElement, options: Partial<WheelPickerOptions>);
    destroy(): void;
    private handleMouseMove;
    private handleClick;
    private font;
    private resultFont;
    private setTheme;
    updateChoices(list: string[]): void;
    private fireSpinEnd;
    private static defaultRandom;
    private createPointer;
    private drawWheel;
    spin(targetIndex?: number, targetAngle?: number): void;
}

export { type SpinEndEvent, WheelPicker, type WheelPickerOptions, WheelPickerOptionsSchema, themes };
