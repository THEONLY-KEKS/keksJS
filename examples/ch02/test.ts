// import { VirtualEntity } from '../../packages/runtime/src/j';
// import { DOM_TYPES } from '../../packages/runtime/src/j';
// import { mountDOM } from '../../packages/runtime/src/mount-dom';

// const virtualDOM: VirtualEntity = {
//     type: DOM_TYPES.ELEMENT,
//     tag: "div",
//     props: { id: "app" },
//     children: [
//       {
//         type: DOM_TYPES.ELEMENT,
//         tag: "h1",
//         children: [
//           {
//             type: DOM_TYPES.TEXT,
//             value: "TODOs",
//           },
//         ],
//       },
//       {
//         type: DOM_TYPES.ELEMENT,
//         tag: "input",
//         props: { type: DOM_TYPES.TEXT, placeholder: "What needs to be done" },
//       },
//       {
//         type: DOM_TYPES.ELEMENT,
//         tag: "ul",
//         children: [
//           {
//             type: DOM_TYPES.ELEMENT,
//             tag: "li",
//             children: [
//               {
//                 type: DOM_TYPES.ELEMENT,
//                 tag: "input",
//                 props: { type: "checkbox" },
//               },
//               {
//                 type: DOM_TYPES.ELEMENT,
//                 tag: "label",
//                 children: [
//                   {
//                     type: DOM_TYPES.TEXT,
//                     value: "Buy Milk",
//                   },
//                 ],
//               },
//               {
//                 type: DOM_TYPES.ELEMENT,
//                 tag: "button",
//                 props: { on: { click: () => null } },
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };

//   mountDOM(virtualDOM, document.body);

