import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick", () => {
    const fn = jest.fn();
    render(<Button onClick={fn}>Test</Button>);
    fireEvent.click(screen.getByText("Test"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("shows spinner when loading", () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop passed", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onClick when disabled", () => {
    const fn = jest.fn();
    render(<Button disabled onClick={fn}>Disabled</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });

  it("applies danger variant class", () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild).toHaveClass("bg-danger-500");
  });

  it("renders icon when provided", () => {
    render(<Button icon={<span data-testid="icon">★</span>}>With icon</Button>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
