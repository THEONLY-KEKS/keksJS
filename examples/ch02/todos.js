import {
  createApp,
  j,
  jFragment,
  defineComponent,
  jString,
} from "/packages/runtime/dist/keksjs.js";

// createApp({
//   state: {
//     orange: 10,
//     apple: 10,
//   },

//   reducers: {
//     add: [
//       (state, amount) => add(state, amount),
//       (state, amount) => addAgain(state, amount),
//     ],
//     subtract: (state, amount) => subtract(state, amount),
//   },

//   view: (state, emit) =>
//     j("div", { class: "display-flex container" }, [
//       j("button", { on: { click: () => emit("subtract", 1) } }, ["-"]),
//       state.orange.toString(),
//       j("button", { on: { click: () => emit("add", 1) } }, ["+"]),
//     ]),
// }).mount(document.body);

// function add(state, increment) {
//    var new = {...state, (orange + increment)}
//   state.orange += increment;
//   return state;
// }

// function addAgain(state, increment) {
//   state.orange += increment;
//   return state;
// }

// function subtract(state, decrement) {
//   state.orange -= decrement;
//   return state;
// }

const state = {
  currentTodo: "",
  edit: {
    idx: null,
    original: null,
    edited: null,
  },
  todos: ["Walk the dog", "Water the plants"],
};

const reducers = {
  "update-current-todo": [
    (state, currentTodo) => ({ ...state, currentTodo }),
    // (state, currentTodo) => {
    //   console.log({ CurrentTodo: currentTodo });
    //   return state;
    // },
  ],
  "add-todo": (state) => ({
    ...state,
    todos: [...state.todos, state.currentTodo],
    currentTodo: "",
  }),
  "start-editing-todo": (state, idx) => ({
    ...state,
    edit: { idx, original: state.todos[idx], edited: state.todos[idx] },
  }),
  "edit-todo": (state, edited) => ({
    ...state,
    edit: { ...state.edit, edited },
  }),
  "save-edited-todo": (state) => {
    const todos = [...state.todos];
    todos[state.edit.idx] = state.edit.edited;
    return {
      ...state,
      edit: { idx: null, original: null, edited: null },
      todos,
    };
  },
  "cancel-editing-todo": (state) => ({
    ...state,
    edit: { idx: null, original: null, edited: null },
  }),
  "remove-todo": (state, idx) => {
    const todos = [...state.todos];
    todos.splice(idx, 1);
    return {
      ...state,
      todos,
    };
  },
};

function App(state, emit) {
  return jFragment([
    j("h1", {}, ["My TODOs"]),
    CreateTodo(state, emit),
    TodoList(state, emit),
  ]);
}

function CreateTodo({ currentTodo }, emit) {
  return j("div", {}, [
    j("label", { for: "todo-input" }, ["New Todo"]),
    j("input", {
      type: "text",
      id: "todo-input",
      value: currentTodo,
      on: {
        input: ({ target }) => {
          console.log({ InputCurrentTodo: currentTodo });
          emit("update-current-todo", target.value);
          console.log({ AfterCurrentTodo: currentTodo });
        },
        keydown: ({ key }) => {
          console.log({ KeyCurrentTodo: currentTodo });
          if (key === "Enter" && currentTodo.length >= 3) {
            emit("add-todo");
          }
        },
      },
    }),
    j(
      "button",
      {
        disabled: currentTodo.length < 3,
        on: {
          click: () => emit("add-todo"),
        },
      },
      ["Add"]
    ),
  ]);
}

function TodoList({ todos, edit }, emit) {
  return j(
    "ul",
    {},
    todos.map((todo, i) => TodoItem({ todo, i, edit }, emit))
  );
}

function TodoItem({ todo, i, edit }, emit) {
  const isEditing = edit.idx === i;
  return isEditing
    ? j("li", {}, [
        j("input", {
          value: edit.edited,
          on: {
            input: ({ target }) => emit("edit-todo", target.value),
          },
        }),
        j(
          "button",
          {
            disabled: edit.edited.length < 3,
            on: {
              click: () => emit("save-edited-todo"),
            },
          },
          ["Save"]
        ),
        j(
          "button",
          {
            on: {
              click: () => emit("cancel-editing-todo"),
            },
          },
          ["Cancel"]
        ),
      ])
    : j("li", {}, [
        j(
          "span",
          {
            on: {
              dblclick: () => emit("start-editing-todo", i),
            },
          },
          [todo]
        ),
        j(
          "button",
          {
            on: {
              click: () => emit("remove-todo", i),
            },
          },
          ["Done"]
        ),
      ]);
}

const Coffee = defineComponent({
  render() {
    const { x, y, width, height } = this.state;
    return jFragment([
      j("h1", {}, ["Important news!"]),
      j("p", {}, ["I made myself coffee"]),
      j(
        "button",
        {
          style: {
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`,
          },
          on: {
            click: () => {
              console.log(this.state);
              this.updateState({
                x: parseInt(Math.random() * width),
                y: parseInt(Math.random() * height),
              });
            },
          },
        },
        ["Log State"]
      ),
    ]);
  },

  state: ({ width, height }) => {
    return {
      width,
      height,
      x: parseInt(Math.random() * width),
      y: parseInt(Math.random() * height),
    };
  },
});

const width = window.innerWidth;
const height = window.innerHeight;

const coffee = new Coffee({ width, height });

console.log({ Coffee: coffee });

const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

async function fetchRandomCocktail() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.drinks[0];
  } catch (err) {
    console.error(err);
    return null;
  }
}

const RandomCocktail = defineComponent({
  state() {
    return {
      isLoading: false,
      cocktail: null,
    };
  },

  render() {
    const { isLoading, cocktail } = this.state;

    if (isLoading) {
      return jFragment([
        j("h1", {}, ["Random Cocktail"]),
        j("p", {}, ["Loading..."]),
      ]);
    }

    if (!cocktail) {
      return jFragment([
        j("h1", {}, ["Random Cocktail"]),
        j("button", { on: { click: this.fetchCocktail } }, ["Get a cocktail"]),
      ]);
    }

    const { strDrink, strDrinkThumb, strInstructions } = cocktail;

    return jFragment([
      j("h1", {}, [strDrink]),
      j("p", {}, [strInstructions]),
      j("img", {
        src: strDrinkThumb,
        alt: strDrink,
        style: { width: "300px", height: "300px" },
      }),
      j(
        "button",
        {
          on: { click: this.fetchCocktail },
          style: { display: "block", margin: "1em auto" },
        },
        ["Get another cocktail"]
      ),
    ]);
  },

  async fetchCocktail() {
    this.updateState({ isLoading: true, cocktail: null });
    const cocktail = await fetchRandomCocktail();

    setTimeout(() => {
      this.updateState({ isLoading: false, cocktail: cocktail });
    }, 1000);
  },
});

const cocktailPage = new RandomCocktail();

cocktailPage.mount(document.body);

//createApp({ state, reducers, view: App }).mount(document.body);
