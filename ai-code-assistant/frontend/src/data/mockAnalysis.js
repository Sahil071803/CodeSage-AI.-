/**
 * Demo Mode data.
 *
 * Everything here is pre-written. No AI model runs and no document retrieval
 * happens. Results are canned for the built-in example program in each language.
 */

export const LANGUAGES = [
  { id: 'python', label: 'Python', extensions: ['py'] },
  { id: 'javascript', label: 'JavaScript', extensions: ['js', 'jsx', 'mjs'] },
  { id: 'java', label: 'Java', extensions: ['java'] },
  { id: 'cpp', label: 'C++', extensions: ['cpp', 'cc', 'cxx', 'hpp'] },
  { id: 'c', label: 'C', extensions: ['c', 'h'] },
  { id: 'typescript', label: 'TypeScript', extensions: ['ts', 'tsx'] },
];

export const CODE_FILE_ACCEPT = `${LANGUAGES.flatMap((l) => l.extensions.map((e) => `.${e}`)).join(',')},.txt`;

export function languageLabel(id) {
  return LANGUAGES.find((l) => l.id === id)?.label ?? id;
}

export function languageFromFilename(name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  return LANGUAGES.find((l) => l.extensions.includes(ext))?.id ?? null;
}

/* ------------------------------------------------------------------ */
/* Example programs (each contains the same classic bugs on purpose)   */
/* ------------------------------------------------------------------ */

const SAMPLES = {
  python: {
    fn: 'calculate_average',
    defMarker: 'def calculate_average',
    loopMarker: 'range(len(numbers) - 1)',
    divMarker: 'return total / len(numbers)',
    emptyEffect: 'raises a ZeroDivisionError',
    emptySeverity: 'medium',
    truncates: false,
    code: `def calculate_average(numbers):
    total = 0
    for i in range(len(numbers) - 1):
        total += numbers[i]
    return total / len(numbers)


scores = [82, 91, 77, 68]
print("Average:", calculate_average(scores))
`,
    fixed: `def calculate_average(numbers):
    """Return the arithmetic mean of numbers, or 0 for an empty list."""
    if not numbers:
        return 0
    total = 0
    for value in numbers:
        total += value
    return total / len(numbers)


scores = [82, 91, 77, 68]
print("Average:", calculate_average(scores))
`,
  },
  javascript: {
    fn: 'calculateAverage',
    defMarker: 'function calculateAverage',
    loopMarker: 'numbers.length - 1',
    divMarker: 'return total / numbers.length',
    emptyEffect: 'returns NaN (0 / 0)',
    emptySeverity: 'medium',
    truncates: false,
    code: `function calculateAverage(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length - 1; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}

const scores = [82, 91, 77, 68];
console.log("Average:", calculateAverage(scores));
`,
    fixed: `/** Returns the arithmetic mean of numbers, or 0 for an empty array. */
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  let total = 0;
  for (const value of numbers) {
    total += value;
  }
  return total / numbers.length;
}

const scores = [82, 91, 77, 68];
console.log("Average:", calculateAverage(scores));
`,
  },
  typescript: {
    fn: 'calculateAverage',
    defMarker: 'function calculateAverage',
    loopMarker: 'numbers.length - 1',
    divMarker: 'return total / numbers.length',
    emptyEffect: 'returns NaN (0 / 0)',
    emptySeverity: 'medium',
    truncates: false,
    code: `function calculateAverage(numbers: number[]): number {
  let total = 0;
  for (let i = 0; i < numbers.length - 1; i++) {
    total += numbers[i];
  }
  return total / numbers.length;
}

const scores: number[] = [82, 91, 77, 68];
console.log("Average:", calculateAverage(scores));
`,
    fixed: `/** Returns the arithmetic mean of numbers, or 0 for an empty array. */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  let total = 0;
  for (const value of numbers) {
    total += value;
  }
  return total / numbers.length;
}

const scores: number[] = [82, 91, 77, 68];
console.log("Average:", calculateAverage(scores));
`,
  },
  java: {
    fn: 'calculateAverage',
    defMarker: 'static double calculateAverage',
    loopMarker: 'numbers.length - 1',
    divMarker: 'return total / numbers.length',
    emptyEffect: 'throws an ArithmeticException (integer division by zero)',
    emptySeverity: 'high',
    truncates: true,
    code: `public class Main {
    static double calculateAverage(int[] numbers) {
        int total = 0;
        for (int i = 0; i < numbers.length - 1; i++) {
            total += numbers[i];
        }
        return total / numbers.length;
    }

    public static void main(String[] args) {
        int[] scores = {82, 91, 77, 68};
        System.out.println("Average: " + calculateAverage(scores));
    }
}
`,
    fixed: `public class Main {
    /** Returns the arithmetic mean of numbers, or 0 for an empty array. */
    static double calculateAverage(int[] numbers) {
        if (numbers.length == 0) {
            return 0.0;
        }
        double total = 0.0;
        for (int value : numbers) {
            total += value;
        }
        return total / numbers.length;
    }

    public static void main(String[] args) {
        int[] scores = {82, 91, 77, 68};
        System.out.println("Average: " + calculateAverage(scores));
    }
}
`,
  },
  cpp: {
    fn: 'calculateAverage',
    defMarker: 'double calculateAverage',
    loopMarker: 'numbers.size() - 1',
    divMarker: 'return total / numbers.size()',
    emptyEffect: 'underflows the unsigned loop bound and reads out of bounds',
    emptySeverity: 'critical',
    truncates: true,
    code: `#include <iostream>
#include <vector>

double calculateAverage(const std::vector<int>& numbers) {
    int total = 0;
    for (size_t i = 0; i < numbers.size() - 1; i++) {
        total += numbers[i];
    }
    return total / numbers.size();
}

int main() {
    std::vector<int> scores = {82, 91, 77, 68};
    std::cout << "Average: " << calculateAverage(scores) << std::endl;
    return 0;
}
`,
    fixed: `#include <iostream>
#include <vector>

// Returns the arithmetic mean of numbers, or 0 for an empty vector.
double calculateAverage(const std::vector<int>& numbers) {
    if (numbers.empty()) {
        return 0.0;
    }
    double total = 0.0;
    for (int value : numbers) {
        total += value;
    }
    return total / numbers.size();
}

int main() {
    std::vector<int> scores = {82, 91, 77, 68};
    std::cout << "Average: " << calculateAverage(scores) << std::endl;
    return 0;
}
`,
  },
  c: {
    fn: 'calculate_average',
    defMarker: 'double calculate_average',
    loopMarker: 'size - 1',
    divMarker: 'return total / size',
    emptyEffect: 'divides by zero, which is undefined behaviour',
    emptySeverity: 'critical',
    truncates: true,
    code: `#include <stdio.h>

double calculate_average(int numbers[], int size) {
    int total = 0;
    for (int i = 0; i < size - 1; i++) {
        total += numbers[i];
    }
    return total / size;
}

int main(void) {
    int scores[] = {82, 91, 77, 68};
    printf("Average: %f\\n", calculate_average(scores, 4));
    return 0;
}
`,
    fixed: `#include <stdio.h>

/* Returns the arithmetic mean of numbers, or 0 when size is 0 or less. */
double calculate_average(int numbers[], int size) {
    if (size <= 0) {
        return 0.0;
    }
    double total = 0.0;
    for (int i = 0; i < size; i++) {
        total += numbers[i];
    }
    return total / size;
}

int main(void) {
    int scores[] = {82, 91, 77, 68};
    printf("Average: %f\\n", calculate_average(scores, 4));
    return 0;
}
`,
  },
};

export const SAMPLE_CODE = Object.fromEntries(Object.entries(SAMPLES).map(([id, s]) => [id, s.code]));

/* ------------------------------------------------------------------ */
/* Knowledge base (sample documents)                                   */
/* ------------------------------------------------------------------ */

export const mockKnowledgeDocs = [
  {
    id: 'kb-python',
    title: 'Python Errors and Exceptions Guide',
    type: 'PDF',
    language: 'Python',
    length: '18 pages',
    size: '412 KB',
    description: 'Built-in exceptions, common causes, and how to handle them.',
    status: 'sample',
  },
  {
    id: 'kb-javascript',
    title: 'JavaScript Language Fundamentals',
    type: 'PDF',
    language: 'JavaScript',
    length: '24 pages',
    size: '530 KB',
    description: 'Numbers, arrays, loops, and common runtime pitfalls.',
    status: 'sample',
  },
  {
    id: 'kb-typescript',
    title: 'TypeScript Handbook Notes',
    type: 'TXT',
    language: 'TypeScript',
    length: '9 sections',
    size: '38 KB',
    description: 'Typed arrays, number semantics, and strict-mode tips.',
    status: 'sample',
  },
  {
    id: 'kb-java',
    title: 'Java Exceptions and Numeric Types',
    type: 'PDF',
    language: 'Java',
    length: '21 pages',
    size: '486 KB',
    description: 'Checked and unchecked exceptions, integer and floating-point arithmetic.',
    status: 'sample',
  },
  {
    id: 'kb-cpp',
    title: 'C++ Containers and Undefined Behavior Notes',
    type: 'PDF',
    language: 'C++',
    length: '15 pages',
    size: '344 KB',
    description: 'std::vector, unsigned arithmetic, and common sources of undefined behavior.',
    status: 'sample',
  },
];

/**
 * Demo "retrieved" passages per language. These are short, pre-written
 * statements, not real retrieval output. C intentionally has none, so the
 * "no supporting documentation" state can be demonstrated.
 */
const SOURCES = {
  python: [
    {
      id: 'src-py-1',
      title: 'Python Errors and Exceptions Guide',
      section: 'Built-in exceptions',
      page: 'Page 6',
      excerpt: 'ZeroDivisionError is raised when the second argument of a division or modulo operation is zero.',
    },
    {
      id: 'src-py-2',
      title: 'Python Errors and Exceptions Guide',
      section: 'Loops and ranges',
      page: 'Page 11',
      excerpt: 'range(stop) produces the integers from 0 up to, but not including, stop. Use the full length to visit every index.',
    },
  ],
  javascript: [
    {
      id: 'src-js-1',
      title: 'JavaScript Language Fundamentals',
      section: 'Numbers',
      page: 'Page 8',
      excerpt: 'Dividing 0 by 0 evaluates to NaN, while dividing a non-zero number by 0 evaluates to Infinity.',
    },
    {
      id: 'src-js-2',
      title: 'JavaScript Language Fundamentals',
      section: 'Arrays',
      page: 'Page 14',
      excerpt: 'Valid array indices run from 0 to length - 1, so a loop condition of i < length visits every element.',
    },
  ],
  typescript: [
    {
      id: 'src-ts-1',
      title: 'TypeScript Handbook Notes',
      section: 'Section 3: Primitive types',
      page: null,
      excerpt: 'The number type covers all numeric values; division by zero produces Infinity or NaN rather than an error.',
    },
    {
      id: 'src-ts-2',
      title: 'TypeScript Handbook Notes',
      section: 'Section 5: Arrays and loops',
      page: null,
      excerpt: 'Prefer for...of when the index is not needed; it visits every element without index arithmetic.',
    },
  ],
  java: [
    {
      id: 'src-java-1',
      title: 'Java Exceptions and Numeric Types',
      section: 'Unchecked exceptions',
      page: 'Page 9',
      excerpt: 'ArithmeticException is thrown when an integer division by zero occurs.',
    },
    {
      id: 'src-java-2',
      title: 'Java Exceptions and Numeric Types',
      section: 'Integer division',
      page: 'Page 16',
      excerpt: 'When both operands of / are integers, the result is an integer and the fractional part is discarded.',
    },
  ],
  cpp: [
    {
      id: 'src-cpp-1',
      title: 'C++ Containers and Undefined Behavior Notes',
      section: 'std::vector',
      page: 'Page 4',
      excerpt: 'size() returns an unsigned type. Subtracting 1 from an empty container wraps around to a very large value.',
    },
    {
      id: 'src-cpp-2',
      title: 'C++ Containers and Undefined Behavior Notes',
      section: 'Undefined behavior',
      page: 'Page 12',
      excerpt: 'Integer division by zero and out-of-bounds element access both result in undefined behavior.',
    },
  ],
  c: [],
};

/* ------------------------------------------------------------------ */
/* Canned analysis builder                                             */
/* ------------------------------------------------------------------ */

function lineOf(code, marker) {
  const index = code.split('\n').findIndex((line) => line.includes(marker));
  return index === -1 ? null : index + 1;
}

function buildExplanation(sample, label) {
  return {
    summary: `This ${label} program defines ${sample.fn}, which is meant to compute the arithmetic mean of a list of numbers. It then calls the function with four sample scores and prints the result.`,
    steps: [
      `Define ${sample.fn}, which receives the collection of numbers to average.`,
      'Start a running total at zero.',
      'Loop over the collection and add each value to the total.',
      'Divide the total by the number of elements to get the mean and return it.',
      'Create a sample collection of four scores, call the function, and print the returned average.',
    ],
    entities: [
      { name: sample.fn, kind: 'function', description: 'Computes the average of the numbers it receives.' },
      { name: 'numbers', kind: 'variable', description: 'The input collection of values to average.' },
      { name: 'total', kind: 'variable', description: 'Running sum updated on each loop iteration.' },
      { name: 'scores', kind: 'variable', description: 'Sample data passed to the function in the example.' },
    ],
    note: 'The loop bound looks off by one, so the last value may be skipped. Run Debug Code for details.',
  };
}

function buildDebug(sample, code, label) {
  const issues = [
    {
      id: 'issue-loop',
      severity: 'high',
      line: lineOf(code, sample.loopMarker),
      title: 'Loop skips the last element',
      description: `The loop stops one position early, so the final value is never added to the total. For the sample scores the function sums 82 + 91 + 77 instead of all four values, which gives a wrong average without any error message.`,
      fix: 'Iterate over every element: use the full length as the loop bound, or loop over the values directly.',
    },
    {
      id: 'issue-empty',
      severity: sample.emptySeverity,
      line: lineOf(code, sample.divMarker),
      title: 'Empty input is not handled',
      description: `When the collection is empty, the division ${sample.emptyEffect}.`,
      fix: 'Check for an empty collection before dividing and return a defined default such as 0.',
    },
  ];

  if (sample.truncates) {
    issues.push({
      id: 'issue-truncate',
      severity: 'medium',
      line: lineOf(code, sample.divMarker),
      title: 'Integer division truncates the average',
      description: 'The total is an integer, so dividing it by an integer discards the fractional part. An average of 79.5 would be reported as 79.',
      fix: 'Accumulate the total in a floating-point variable (double) before dividing.',
    });
  }

  issues.push({
    id: 'issue-docs',
    severity: 'low',
    line: lineOf(code, sample.defMarker),
    title: 'Behavior for empty input is undocumented',
    description: 'Callers cannot tell what the function returns for an empty collection.',
    fix: 'Add a short comment or docstring describing the return value for empty input.',
  });

  return {
    summary: `Found ${issues.length} potential issues in this ${label} example. The most important is the off-by-one loop bound that silently produces a wrong average.`,
    issues,
    correctedCode: sample.fixed,
  };
}

/**
 * Returns a pre-written analysis for the selected language.
 * @param {{ mode: 'explain' | 'debug', code: string, language: string }} args
 */
export function buildMockAnalysis({ mode, code, language }) {
  const sample = SAMPLES[language] ?? SAMPLES.python;
  const label = languageLabel(language in SAMPLES ? language : 'python');
  return {
    mode,
    demo: true,
    matchesExample: code.includes(sample.loopMarker),
    explanation: mode === 'explain' ? buildExplanation(sample, label) : null,
    debug: mode === 'debug' ? buildDebug(sample, code, label) : null,
    sources: SOURCES[language] ?? [],
    generatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Seed history                                                        */
/* ------------------------------------------------------------------ */

export function createSeedHistory() {
  const hour = 3600 * 1000;
  const now = Date.now();

  const make = (id, mode, language, hoursAgo, title) => {
    const code = SAMPLE_CODE[language];
    const analysis = buildMockAnalysis({ mode, code, language });
    return {
      id,
      mode,
      language,
      title,
      code,
      problem: '',
      createdAt: new Date(now - hoursAgo * hour).toISOString(),
      issueCount: analysis.debug ? analysis.debug.issues.length : null,
      sample: true,
      result: {
        explanation: analysis.explanation,
        debug: analysis.debug,
        sources: analysis.sources,
        demo: true,
        matchesExample: true,
        analyzedCode: code,
        language,
      },
    };
  };

  return [
    make('seed-1', 'debug', 'python', 2, 'Wrong average from a list of scores'),
    make('seed-2', 'explain', 'javascript', 26, 'How does calculateAverage work?'),
    make('seed-3', 'debug', 'java', 74, 'ArithmeticException on empty array'),
  ];
}
