import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WelcomeMessage from "../WelcomeMessage";

describe("WelcomeMessage", () => {
  it("renders welcome message with user name from props", () => {
    // Arrange
    const mockName = "Test User";
    const mockSignOut = vi.fn();

    // Act
    render(<WelcomeMessage name={mockName} signOut={mockSignOut} />);

    // Assert
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("calls signOut callback when button is clicked", () => {
    // Arrange
    const mockName = "Test User";
    const mockSignOut = vi.fn();

    // Act
    render(<WelcomeMessage name={mockName} signOut={mockSignOut} />);

    // Assert
    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();

    // Act - click the button
    fireEvent.click(signOutButton);

    // Assert - check if callback was called
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
