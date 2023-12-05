import PDFDocument from "pdfkit";

interface Options extends PDFKit.PDFDocumentOptions {
  width?: number;
  columnSpacing?: number;
  rowSpacing?: number;
  prepareHeader?: (header?: string, i?: number) => void;
  prepareRow?: (rows?: string[], i?: number) => void;
  columnWidthsDistribution?: number[] | null | undefined;
}

export class PDFDocumentWithTables extends PDFDocument {
  constructor(options: Options) {
    super(options);
  }

  table(
    table: { headers: string[]; rows: string[][] },
    x?: number,
    y?: number,
    arg2?: Options
  ) {
    let startX = this.page.margins.left,
      startY = this.y;
    let options: Options = {};

    if (typeof x === "number" && typeof y === "number") {
      startX = x;
      startY = y;

      if (typeof arg2 === "object") options = arg2;
    } else if (typeof x === "object") {
      options = x;
    }

    const columnCount = table.headers.length;
    const columnSpacing: number = options.columnSpacing || 15;
    const rowSpacing: number = options.rowSpacing || 5;
    const usableWidth: number =
      options.width ||
      this.page.width - this.page.margins.left - this.page.margins.right;

    const prepareHeader = options.prepareHeader || (() => {});
    const prepareRow = options.prepareRow || (() => {});
    const columnWidthsDistribution = options.columnWidthsDistribution || null;
    const computeRowHeight = (row: string[]) => {
      let result = 0;

      row.forEach((cell, i) => {
        const cellHeight = this.heightOfString(cell, {
          width: columnWidthsDistribution
            ? columnWidthsDistribution[i]! * usableWidth - columnSpacing
            : columnWidth,
          align: "left",
        });
        result = Math.max(result, cellHeight);
      });

      return result + rowSpacing;
    };

    const columnContainerWidth = usableWidth / columnCount;
    const columnWidth = columnContainerWidth - columnSpacing;
    const maxY = this.page.height - this.page.margins.bottom;

    let rowBottomY = 0;

    this.on("pageAdded", () => {
      startY = this.page.margins.top;
      rowBottomY = 0;
    });

    // Allow the user to override style for headers
    prepareHeader();

    // Check to have enough room for header and first rows
    if (startY + 3 * computeRowHeight(table.headers) > maxY) this.addPage();

    // Print all headers
    table.headers.forEach((header, i) => {
      this.text(
        header,
        startX +
          (columnWidthsDistribution
            ? columnWidthsDistribution
                .filter((e, j) => j < i)
                .reduce((acc, v) => acc + v, 0) * usableWidth
            : i * columnContainerWidth),
        startY,
        {
          width: columnWidthsDistribution
            ? columnWidthsDistribution[i]! * usableWidth - columnSpacing
            : columnWidth,
          align: "left",
        }
      );
    });

    // Refresh the y coordinate of the bottom of the headers row
    rowBottomY = Math.max(startY + computeRowHeight(table.headers), rowBottomY);

    // Separation line between headers and rows
    this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
      .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
      .lineWidth(2)
      .stroke();

    table.rows.forEach((row, i) => {
      const rowHeight = computeRowHeight(row);

      // Switch to next page if we cannot go any further because the space is over.
      // For safety, consider 3 rows margin instead of just one
      if (startY + 3 * rowHeight < maxY) startY = rowBottomY + rowSpacing;
      else this.addPage();

      // Allow the user to override style for rows
      prepareRow(row, i);

      // Print all cells of the current row
      row.forEach((cell, i) => {
        this.text(
          cell,
          startX +
            (columnWidthsDistribution
              ? columnWidthsDistribution
                  .filter((e, j) => j < i)
                  .reduce((acc, v) => acc + v, 0) * usableWidth
              : i * columnContainerWidth),
          startY,
          {
            width: columnWidthsDistribution
              ? columnWidthsDistribution[i]! * usableWidth - columnSpacing
              : columnWidth,
            align: "left",
          }
        );
      });

      // Refresh the y coordinate of the bottom of this row
      rowBottomY = Math.max(startY + rowHeight, rowBottomY);

      // Separation line between rows
      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(1)
        .opacity(0.7)
        .stroke()
        .opacity(1); // Reset opacity after drawing the line
    });

    this.x = startX;
    this.moveDown();

    return this;
  }
}
