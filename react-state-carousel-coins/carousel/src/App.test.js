import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App"

test("renders without crashing", () => {
    render(<App />)
})

it("matches snapshot", () => {
    const { asFragment } = render( <App /> )
    expect(asFragment()).toMatchSnapshot()
})