import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders label", () => {
    render(<Input label="Email" />);
    // CSS uppercase doesn't change DOM text content
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders placeholder", () => {
    render(<Input placeholder="Digite aqui" />);
    expect(screen.getByPlaceholderText("Digite aqui")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input error="Campo obrigatório" />);
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("applies error border class when error present", () => {
    const { container } = render(<Input error="Erro" />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("border-danger-500/60");
  });

  it("fires onChange", () => {
    const fn = jest.fn();
    render(<Input onChange={fn} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(fn).toHaveBeenCalled();
  });

  it("links label to input via id", () => {
    render(<Input label="Nome" id="nome-input" />);
    // CSS uppercase doesn't change DOM text content
    const label = screen.getByText("Nome");
    expect(label).toHaveAttribute("for", "nome-input");
  });

  it("renders left element", () => {
    render(<Input leftEl={<span data-testid="left">@</span>} />);
    expect(screen.getByTestId("left")).toBeInTheDocument();
  });
});