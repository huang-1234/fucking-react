
export interface IStyleMargin {
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
}
export interface IStylePadding {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
}
export interface IStyleBorder {
  borderTop: string;
  borderBottom: string;
  borderLeft: string;
  borderRight: string;
}
export interface IStyleBorderRadius {
  borderRadiusTopLeft: string;
  borderRadiusTopRight: string;
  borderRadiusBottomLeft: string;
  borderRadiusBottomRight: string;
}
export interface IStyleBackground {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
}

export interface IStyleBasic
  extends Partial<IStyleMargin>,
  Partial<IStylePadding>,
  Partial<IStyleBorder>,
  Partial<IStyleBorderRadius>,
  Partial<IStyleBackground> {

}
export interface IStyleFont {
  color: string;
  fontSize: string;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
}
export interface IStyleText {
  textAlign: string;
  textDecoration: string;
  textTransform: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  textShadow: string;
}
export interface DyStyleView extends IStyleBasic, IStyleFont {
  width: string;
  height: string;
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  flexWrap: string;
}

export interface DyStyleText extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleButton extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleInput extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleImage extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleVideo extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleAudio extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleIframe extends IStyleBasic, IStyleFont, IStyleText {

}

export interface DyStyleEmbed extends IStyleBasic, IStyleFont, IStyleText {

}