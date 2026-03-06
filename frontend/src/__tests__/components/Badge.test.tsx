import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, StatusBadge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Teste</Badge>);
    expect(screen.getByText("Teste")).toBeInTheDocument();
  });

  it("renders dot when dot=true", () => {
    const { container } = render(<Badge dot>Label</Badge>);
    const dot = container.querySelector(".rounded-full.w-1\\.5");
    expect(dot).toBeInTheDocument();
  });

  it("applies brand variant classes", () => {
    const { container } = render(<Badge variant="brand">Brand</Badge>);
    expect(container.firstChild).toHaveClass("bg-brand-500/15");
  });

  it("applies danger variant classes", () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    expect(container.firstChild).toHaveClass("bg-danger-500/15");
  });
});

describe("StatusBadge", () => {
  it("renders 'Ativa' for active status", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("Ativa")).toBeInTheDocument();
  });

  it("renders 'Cancelada' for canceled status", () => {
    render(<StatusBadge status="canceled" />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("applies success variant for active", () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild).toHaveClass("bg-success-500/15");
  });

  it("applies danger variant for canceled", () => {
    const { container } = render(<StatusBadge status="canceled" />);
    expect(container.firstChild).toHaveClass("bg-danger-500/15");
  });
});