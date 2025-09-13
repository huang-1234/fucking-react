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
      __name: "header",
      __type: "dycomponents::view",
      __props: {
        __name: "header",
        tabs: [
          {
            label: "Home",
            value: "home",
          },
          {
            label: "Profile",
            value: "profile",
          },
          {
            label: "Settings",
            value: "settings",
          },
        ],
        __style: {
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "10px",
          paddingRight: "10px",
          borderTop: "1px solid #000",
          borderBottom: "1px solid #000",
          borderLeft: "1px solid #000",
        },
        __text: "Header",
      },
    },
    {
      __id: "1_1_2",
      __name: "content",
      __type: "dycomponents::view",
      __props: {
        __name: "content",
        __style: {
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "10px",
        paddingRight: "10px",
      } as IStyleBasic,
      },
      __children: [
        {
          __id: "1_1_2_1",
          __name: "list",
          __type: "dycomponents::view",
          __props: {
            __name: "list",
            __style: {
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              paddingRight: "10px",
            } as IStyleBasic,
          },
          __children: [
            {
              __id: "1_1_2_1_1",
              __name: "list_item",
              __type: "dycomponents::view",
            },
            {
              __id: "1_1_2_1_2",
              __name: "list_item",
              __type: "dycomponents::view",
            },
            {
              __id: "1_1_2_1_3",
              __name: "list_item",
              __type: "dycomponents::view",
            },
            {
              __id: "1_1_2_1_4",
              __name: "list_item",
              __type: "dycomponents::view",
            },
          ],
        },
      ],
    }
  ],
};
