// lib/services/google-meet.service.ts
import { google } from "googleapis"

function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
  })

  return google.calendar({ version: "v3", auth: oauth2Client })
}

export async function createMeetSession(params: {
  title: string
  description: string
  startTime: Date
  endTime: Date
  attendeeEmail: string
  timezone: string  // ← from booking/user, not hardcoded
}): Promise<{ meetLink: string; eventId: string }> {
  const calendar = getCalendarClient()

  const event = await calendar.events.insert({
    calendarId: "primary", // Parys's calendar
    conferenceDataVersion: 1,
    requestBody: {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: params.timezone,
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: params.timezone,
      },
      attendees: [
        { email: params.attendeeEmail }, // student
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 1440 }, // 24h before
          { method: "popup", minutes: 30 },   // 30min before
        ],
      },
    },
  })

  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video"
    )?.uri || ""

  return {
    meetLink,
    eventId: event.data.id || "",
  }
}