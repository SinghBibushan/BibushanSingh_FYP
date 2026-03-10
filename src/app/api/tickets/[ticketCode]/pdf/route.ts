import { NextResponse } from "next/server";

import { buildTicketPdf } from "@/server/tickets/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketCode: string }> },
) {
  try {
    const { ticketCode } = await params;
    const pdfBytes = await buildTicketPdf(ticketCode);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${ticketCode}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate ticket PDF.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
