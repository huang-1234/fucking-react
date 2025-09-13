import { DySchema } from "./schema";
import { IStyleBasic } from "./style";

export const dy_view_schema: DySchema = {
  __id: "1_1",
  __name: "dy_view",
  __type: "dycomponents::view",
  __isContainer: true,
  __props: {
    __name: "dy_view",
    __style: {
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "10px",
      paddingRight: "10px",
      borderTop: "1px solid #000",
      borderBottom: "1px solid #000",
      borderLeft: "1px solid #000",
      borderRight: "1px solid #000",
      borderRadiusTopLeft: "10px",
      borderRadiusTopRight: "10px",
      borderRadiusBottomLeft: "10px",
      borderRadiusBottomRight: "10px",
      backgroundColor: "#000",
    } as IStyleBasic,
  },
  __children: [
    {
      __id: "1_1_1",
      __name: "dy_text",
      __type: "dycomponents::text",
      __props: {
        __name: "dy_text",
        __style: {
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "10px",
          paddingRight: "10px",
          borderTop: "1px solid #000",
          borderBottom: "1px solid #000",
          borderLeft: "1px solid #000",
        },
        __text: "Hello, world!",
      },
    }
  ],
};
