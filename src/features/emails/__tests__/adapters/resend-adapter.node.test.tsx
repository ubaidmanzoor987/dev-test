import { describe, it, expect } from "vitest";
import { SendEmailPropsSchema } from "../../types";
import { resendEmailAdapter } from "../../adapters/resend-adapter";
import React from "react";
import { env } from "@/env";

describe("resendEmailAdapter", () => {
  it("should correctly adapt string HTML content", () => {
    // Arrange
    const inputProps = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      content: "<p>Hello, world!</p>",
    };

    // Act
    const result = resendEmailAdapter(inputProps);

    // Assert
    expect(result).toEqual({
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      html: "<p>Hello, world!</p>",
    });
    expect(result.html).toBe("<p>Hello, world!</p>");
    expect(result.react).toBeUndefined();
  });

  it("should correctly adapt React node content", () => {
    // Arrange
    const TestComponent = () => <p>Hello from React</p>;
    const inputProps = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      content: <TestComponent />,
    };

    // Act
    const result = resendEmailAdapter(inputProps);

    // Assert
    expect(result).toEqual({
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      react: expect.any(Object), // eslint-disable-line
    });
    expect(result.html).toBeUndefined();
    expect(React.isValidElement(result.react)).toBe(true);
  });

  it("should reject unrecognized properties to prevent unexpected data reaching the email service", () => {
    // Arrange
    const propsWithUnrecognizedFields = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      content: "<p>Hello, world!</p>",
      // Properties not in the schema:
      // These email fields would be dangerous if passed to the email service
      cc: ["cc@example.com"],
      bcc: ["bcc@example.com"],
      replyTo: "reply@example.com",
    };

    // Act & Assert
    expect(() => resendEmailAdapter(propsWithUnrecognizedFields)).toThrow(
      /Unrecognized key\(s\) in object/,
    );
  });

  it("should reject input missing required fields", () => {
    // Arrange
    const incompleteProps = {
      from: "test@example.com",
      // Missing 'to' field
      subject: "Test Email",
      content: "<p>Hello, world!</p>",
    };

    // Act & Assert
    expect(() => resendEmailAdapter(incompleteProps)).toThrow();
  });

  it("should apply schema transformations to input data", () => {
    // This test verifies that the schema's transformations are applied
    // For example, the default 'text' value when not provided

    // Arrange - Create minimal valid input without optional fields
    const minimalInput = {
      to: "recipient@example.com",
      subject: "Test Email",
      content: "<p>Hello, world!</p>",
      // Omitting 'from' and 'text' which have defaults in the schema
    };

    // First validate with schema to get transformed values
    const transformedProps = SendEmailPropsSchema.parse(minimalInput);

    // Act
    const result = resendEmailAdapter(transformedProps);

    // Assert
    expect(result.text).toBe("This email does not have a text version.");
    expect(result.from).toBe(env.RESEND_FROM_EMAIL); // Should have default from email
  });

  it("should handle empty content gracefully", () => {
    // Arrange
    const inputProps = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      content: "",
      text: "Plain text version",
    };

    // Act
    const result = resendEmailAdapter(inputProps);

    // Assert
    expect(result).toEqual({
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      html: "",
      text: "Plain text version",
    });
  });

  it("should handle recipient as an array of addresses", () => {
    // Arrange
    const inputProps = {
      from: "test@example.com",
      to: ["recipient1@example.com", "recipient2@example.com"],
      subject: "Test Email",
      content: "<p>Hello, world!</p>",
      text: "Plain text version",
    };

    // Act
    const result = resendEmailAdapter(inputProps);

    // Assert
    expect(result.to).toEqual([
      "recipient1@example.com",
      "recipient2@example.com",
    ]);
  });
});
