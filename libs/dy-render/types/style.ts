
export interface styleMargin {
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
}
export interface stylePadding {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
}
export interface styleBorder {
  borderTop: string;
  borderBottom: string;
  borderLeft: string;
  borderRight: string;
}
export interface styleBorderRadius {
  borderRadiusTopLeft: string;
  borderRadiusTopRight: string;
  borderRadiusBottomLeft: string;
  borderRadiusBottomRight: string;
}
export interface styleBackground {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
}

export interface styleBasic extends styleMargin, stylePadding, styleBorder, styleBorderRadius, styleBackground {

}
export interface styleFont {
  color: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  fontFamily: string;
}
export interface styleText {
  textAlign: string;
  textDecoration: string;
  textTransform: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  textShadow: string;
}
export interface DyStyleView extends styleBasic, styleFont {
  width: string;
  height: string;
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  flexWrap: string;
}

export interface DyStyleText extends styleBasic, styleFont, styleText {

}

export interface DyStyleButton extends styleBasic, styleFont, styleText {

}

export interface DyStyleInput extends styleBasic, styleFont, styleText {

}

export interface DyStyleImage extends styleBasic, styleFont, styleText {

}

export interface DyStyleVideo extends styleBasic, styleFont, styleText {

}

export interface DyStyleAudio extends styleBasic, styleFont, styleText {

}

export interface DyStyleIframe extends styleBasic, styleFont, styleText {

}

export interface DyStyleEmbed extends styleBasic, styleFont, styleText {

}