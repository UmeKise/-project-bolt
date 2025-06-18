import { AccessibilityInfo, Platform } from 'react-native';

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private isScreenReaderEnabled: boolean = false;
  private isReduceMotionEnabled: boolean = false;
  private isBoldTextEnabled: boolean = false;
  private isInvertColorsEnabled: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      this.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      this.isInvertColorsEnabled = await AccessibilityInfo.isInvertColorsEnabled();

      // スクリーンリーダーの状態変更を監視
      AccessibilityInfo.addEventListener(
        'screenReaderChanged',
        this.handleScreenReaderChanged
      );

      // モーション設定の変更を監視
      AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        this.handleReduceMotionChanged
      );

      // 太字テキスト設定の変更を監視
      AccessibilityInfo.addEventListener(
        'boldTextChanged',
        this.handleBoldTextChanged
      );

      // 色反転設定の変更を監視
      AccessibilityInfo.addEventListener(
        'invertColorsChanged',
        this.handleInvertColorsChanged
      );
    } catch (error) {
      console.error('アクセシビリティ設定の初期化に失敗しました:', error);
    }
  }

  private handleScreenReaderChanged = (isEnabled: boolean): void => {
    this.isScreenReaderEnabled = isEnabled;
  };

  private handleReduceMotionChanged = (isEnabled: boolean): void => {
    this.isReduceMotionEnabled = isEnabled;
  };

  private handleBoldTextChanged = (isEnabled: boolean): void => {
    this.isBoldTextEnabled = isEnabled;
  };

  private handleInvertColorsChanged = (isEnabled: boolean): void => {
    this.isInvertColorsEnabled = isEnabled;
  };

  public isScreenReaderActive(): boolean {
    return this.isScreenReaderEnabled;
  }

  public isReduceMotionActive(): boolean {
    return this.isReduceMotionEnabled;
  }

  public isBoldTextActive(): boolean {
    return this.isBoldTextEnabled;
  }

  public isInvertColorsActive(): boolean {
    return this.isInvertColorsEnabled;
  }

  public getAccessibilityConfig() {
    return {
      isScreenReaderEnabled: this.isScreenReaderEnabled,
      isReduceMotionEnabled: this.isReduceMotionEnabled,
      isBoldTextEnabled: this.isBoldTextEnabled,
      isInvertColorsEnabled: this.isInvertColorsEnabled,
    };
  }

  public getAccessibilityProps(
    label: string,
    hint?: string,
    role?: string
  ) {
    const props: any = {
      accessible: true,
      accessibilityLabel: label,
    };

    if (hint) {
      props.accessibilityHint = hint;
    }

    if (role) {
      props.accessibilityRole = role;
    }

    if (Platform.OS === 'ios') {
      props.accessibilityElementsHidden = false;
      props.importantForAccessibility = 'yes';
    }

    return props;
  }

  public cleanup(): void {
    AccessibilityInfo.removeEventListener(
      'screenReaderChanged',
      this.handleScreenReaderChanged
    );
    AccessibilityInfo.removeEventListener(
      'reduceMotionChanged',
      this.handleReduceMotionChanged
    );
    AccessibilityInfo.removeEventListener(
      'boldTextChanged',
      this.handleBoldTextChanged
    );
    AccessibilityInfo.removeEventListener(
      'invertColorsChanged',
      this.handleInvertColorsChanged
    );
  }
}

export const accessibilityManager = AccessibilityManager.getInstance(); 