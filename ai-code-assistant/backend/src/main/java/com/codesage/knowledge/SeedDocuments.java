package com.codesage.knowledge;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Small built-in documentation set so the RAG pipeline has real content on a
 * fresh start. Replace or extend via PDF/TXT uploads on the Knowledge Base page.
 */
@Component
public class SeedDocuments {

    public record Seed(String id, String title, String type, String language, String description, String body) {
    }

    public List<Seed> all() {
        return List.of(
                new Seed("doc-python", "Python Errors and Exceptions Guide", "TXT", "Python",
                        "Built-in exceptions, common causes, and how to handle them.", PYTHON),
                new Seed("doc-javascript", "JavaScript Numbers and Arrays", "TXT", "JavaScript",
                        "Numeric semantics, division by zero, and array index rules.", JAVASCRIPT),
                new Seed("doc-typescript", "TypeScript Primitive Types and Arrays", "TXT", "TypeScript",
                        "Typing arrays and numbers, and strict mode tips.", TYPESCRIPT),
                new Seed("doc-java", "Java Exceptions and Numeric Types", "TXT", "Java",
                        "Checked vs unchecked exceptions and integer arithmetic.", JAVA),
                new Seed("doc-c-cpp", "C and C++ Undefined Behavior Notes", "TXT", "C++",
                        "Out-of-bounds access, unsigned arithmetic, and other UB traps.", C_CPP)
        );
    }

    private static final String PYTHON = """
            ZeroDivisionError
            ZeroDivisionError is raised when the second argument of a division or modulo
            operation is zero. Guard the denominator before dividing, for example
            "if not numbers: return 0.0" before returning total / len(numbers).

            range and off-by-one loops
            range(stop) produces the integers from 0 up to, but not including, stop, so
            range(len(numbers) - 1) skips the last element. When you need every index,
            iterate over range(len(numbers)). Prefer looping over the values directly
            with "for value in numbers" when the index is not needed.

            Empty sequences
            len([]) is 0, so an "average" of an empty sequence is undefined. Decide on a
            documented default, such as returning 0.0, and make sure callers can see the
            decision in the function docstring.

            Documenting behavior with docstrings
            A docstring is the first statement in a function body. Describe parameters,
            the return value, and what happens for edge cases such as empty input so
            call sites do not have to guess.
            """;

    private static final String JAVASCRIPT = """
            Division by zero yields Infinity or NaN
            In JavaScript, dividing a non-zero number by 0 returns Infinity and dividing
            0 by 0 returns NaN, so an average function must check length === 0 before
            dividing. Use Number.isFinite to detect bad results.

            Array indices run from 0 to length - 1
            Valid array indices run from 0 to length - 1, so a loop condition of
            i < numbers.length - 1 skips the last element. Use i < numbers.length, or
            prefer for...of when the index is not needed.

            Empty arrays
            An empty array has length 0, so any computed average is undefined. Return a
            documented default such as 0 for empty input rather than NaN.

            JSDoc comments
            A JSDoc comment above a function documents its parameters and return value,
            which helps editors and reviewers see the expected behavior for edge cases.
            """;

    private static final String TYPESCRIPT = """
            The number type and division
            The TypeScript number type covers all numeric values, and division by zero
            produces Infinity or NaN rather than an error. Check that an array is not
            empty before dividing its sum by its length.

            Typed array loops
            A for...of loop visits every element of a typed array without index
            arithmetic, which avoids off-by-one bugs such as looping only to
            length - 1. Keep the index loop only when you truly need positions.

            never for impossible states
            TypeScript can express impossible states with the never type, which is
            useful when documenting why an empty input cannot reach a computation.

            Documenting with TSDoc
            TSDoc comments describe parameters and return values in a typed way so that
            empty-input behavior is explicit at call sites.
            """;

    private static final String JAVA = """
            ArithmeticException on integer division by zero
            ArithmeticException is thrown when an integer division by zero occurs. When
            the denominator can be zero, such as an empty array whose length is used as
            the divisor, guard it and return a documented default like 0.0.

            Integer division truncates
            When both operands of / are integers, the result is an integer and the
            fractional part is discarded, so an average of 79.5 becomes 79. Accumulate
            the total in a double before dividing.

            Enhanced for loops
            The enhanced for loop (for (int value : numbers)) visits every element and
            removes the chance of an off-by-one bound such as i < numbers.length - 1.

            Javadoc
            A Javadoc comment on a method can document the return value and the
            behavior for an empty input so callers know what to expect.
            """;

    private static final String C_CPP = """
            Undefined behavior and out-of-bounds access
            In C and C++, integer division by zero and out-of-bounds element access are
            undefined behavior, which can crash or silently corrupt data. Always check
            that the container is not empty before dividing by its size.

            Unsigned underflow with size() - 1
            std::vector::size() returns an unsigned type, so subtracting 1 from an empty
            container wraps around to a very large value and the loop reads far out of
            bounds. Guard with if (numbers.empty()) { return 0.0; }.

            Floating point averages
            Integer division in C++ truncates toward zero, so an average of 79.5 prints
            as 79 when both operands are integers. Accumulate the total in a double.

            Comments documenting edge cases
            A short comment above a function describing the return value for empty
            input makes the contract visible to every caller.
            """;
}
