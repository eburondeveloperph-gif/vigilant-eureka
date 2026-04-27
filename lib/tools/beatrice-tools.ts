import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const beatriceTools: FunctionCall[] = [
  {
    name: 'document_scan_start',
    description: 'Opens Beatrice media/file intake so the user can take a normal photo/video or upload an image/document. Readable documents can still be OCR analyzed and saved.',
    parameters: {
      type: 'OBJECT',
      properties: {
        userRequest: {
          type: 'STRING',
          description: 'The user request that explains what they want from the uploaded photo, video, image, or document.',
        },
        autoSaveLongMemory: {
          type: 'BOOLEAN',
          description: 'Whether Beatrice should save readable document text directly to long memory after OCR and analysis.',
        },
      },
      required: ['userRequest'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'document_memory_search',
    description: 'Searches Beatrice long-term document memory for previously scanned documents and returns the most relevant matches.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Natural language search query, such as "the French agreement from yesterday".',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'document_memory_save',
    description: 'Saves the currently active scanned document into long-term memory.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Optional title override for the saved document.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'document_memory_forget',
    description: 'Deletes a previously saved scanned document from Beatrice memory.',
    parameters: {
      type: 'OBJECT',
      properties: {
        memoryId: {
          type: 'STRING',
          description: 'Optional explicit memory id to forget. If omitted, Beatrice should forget the active scanned document.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'gmail_send',
    description: 'Sends an email using Gmail.',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipient: { type: 'STRING', description: 'The email address of the recipient.' },
        subject: { type: 'STRING', description: 'The subject line of the email.' },
        body: { type: 'STRING', description: 'The body content of the email.' },
      },
      required: ['recipient', 'subject', 'body'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'gmail_read',
    description: 'Reads all matching emails from the user\'s Gmail inbox. Returns every email matching the query so the user never misses anything — always fetch up to 500.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Optional search query to filter emails. Examples: "is:unread", "from:someone@gmail.com", "subject:invoice", or any Gmail search syntax.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'calendar_create_event',
    description: 'Creates a new event in Google Calendar.',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING', description: 'The title or summary of the event.' },
        location: { type: 'STRING', description: 'The location of the event.' },
        startTime: { type: 'STRING', description: 'The start time of the event in ISO 8601 format.' },
        endTime: { type: 'STRING', description: 'The end time of the event in ISO 8601 format.' },
      },
      required: ['summary', 'startTime', 'endTime'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'calendar_check_schedule',
    description: 'Checks the user\'s Google Calendar schedule for conflicts or free time.',
    parameters: {
      type: 'OBJECT',
      properties: {
        date: { type: 'STRING', description: 'The date to check in ISO 8601 format.' }
      },
      required: ['date'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'drive_search',
    description: 'Searches for a file or folder in Google Drive.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'The search query or filename.' }
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'drive_knowledge_sync',
    description: 'Fetches documents from the current user\'s Google Drive "Beatrice Knowledge Base" folder, extracts readable content, and stores it in Beatrice long-term document memory.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of Drive files to inspect. Default 50.',
        },
        force: {
          type: 'BOOLEAN',
          description: 'Whether to re-import files even if the same Drive modified timestamp was already synced.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'docs_create',
    description: 'Creates a new Google Doc.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the new document.' },
        content: { type: 'STRING', description: 'Initial content to add to the document.' }
      },
      required: ['title'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'sheets_create',
    description: 'Creates a new Google Sheet. Optionally include initial rows as a two-dimensional values array.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Spreadsheet title.' },
        values: {
          type: 'ARRAY',
          items: { type: 'ARRAY', items: { type: 'STRING' } },
          description: 'Optional initial rows, e.g. [["Name","Email"],["Ada","ada@example.com"]].',
        },
      },
      required: ['title'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'sheets_read',
    description: 'Reads a range from an existing Google Sheet.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spreadsheetId: { type: 'STRING', description: 'Google Sheets spreadsheet id.' },
        range: { type: 'STRING', description: 'A1 range, e.g. "Sheet1!A1:D20". Default Sheet1!A1:Z1000.' },
      },
      required: ['spreadsheetId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'sheets_append',
    description: 'Appends rows to a Google Sheet range.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spreadsheetId: { type: 'STRING', description: 'Google Sheets spreadsheet id.' },
        range: { type: 'STRING', description: 'A1 range to append into. Default Sheet1!A1.' },
        values: {
          type: 'ARRAY',
          items: { type: 'ARRAY', items: { type: 'STRING' } },
          description: 'Rows to append as a two-dimensional array.',
        },
      },
      required: ['spreadsheetId', 'values'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'sheets_update',
    description: 'Writes or overwrites values in a Google Sheet range.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spreadsheetId: { type: 'STRING', description: 'Google Sheets spreadsheet id.' },
        range: { type: 'STRING', description: 'A1 range to update, e.g. "Sheet1!A1:C3".' },
        values: {
          type: 'ARRAY',
          items: { type: 'ARRAY', items: { type: 'STRING' } },
          description: 'Rows to write as a two-dimensional array.',
        },
      },
      required: ['spreadsheetId', 'range', 'values'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'slides_create',
    description: 'Creates a new Google Slides presentation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Presentation title.' },
      },
      required: ['title'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'slides_add_slide',
    description: 'Adds a title-and-body slide to an existing Google Slides deck.',
    parameters: {
      type: 'OBJECT',
      properties: {
        presentationId: { type: 'STRING', description: 'Google Slides presentation id.' },
        title: { type: 'STRING', description: 'Slide title.' },
        body: { type: 'STRING', description: 'Slide body text.' },
      },
      required: ['presentationId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'slides_get',
    description: 'Loads metadata for an existing Google Slides deck.',
    parameters: {
      type: 'OBJECT',
      properties: {
        presentationId: { type: 'STRING', description: 'Google Slides presentation id.' },
      },
      required: ['presentationId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'tasks_list_lists',
    description: 'Lists the user\'s Google Tasks lists.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'tasks_list',
    description: 'Lists tasks from a Google Tasks list. Uses the default list if listId is omitted.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listId: { type: 'STRING', description: 'Optional Google Tasks list id.' },
        showCompleted: { type: 'BOOLEAN', description: 'Whether completed tasks should be included.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'tasks_create',
    description: 'Creates a Google Task in the default or specified task list.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listId: { type: 'STRING', description: 'Optional Google Tasks list id.' },
        title: { type: 'STRING', description: 'Task title.' },
        notes: { type: 'STRING', description: 'Optional notes.' },
        due: { type: 'STRING', description: 'Optional ISO due date/time.' },
      },
      required: ['title'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'tasks_complete',
    description: 'Marks a Google Task complete.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listId: { type: 'STRING', description: 'Optional Google Tasks list id.' },
        taskId: { type: 'STRING', description: 'Task id.' },
      },
      required: ['taskId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'tasks_delete',
    description: 'Deletes a Google Task.',
    parameters: {
      type: 'OBJECT',
      properties: {
        listId: { type: 'STRING', description: 'Optional Google Tasks list id.' },
        taskId: { type: 'STRING', description: 'Task id.' },
      },
      required: ['taskId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'people_search',
    description: 'Searches the user\'s Google contacts by name, email, phone, or organization.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Contact search query.' },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'people_list',
    description: 'Lists recently modified Google contacts for the signed-in user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'INTEGER', description: 'Maximum contacts to return, 1-100. Default 30.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'forms_create',
    description: 'Creates a Google Form. Optionally include starter questions with title, description, required, options, choiceType, and paragraph.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Form title.' },
        documentTitle: { type: 'STRING', description: 'Optional Drive document title.' },
        questions: {
          type: 'ARRAY',
          items: { type: 'OBJECT' },
          description: 'Optional starter questions. If options are supplied, a choice question is created; otherwise a text question is created.',
        },
      },
      required: ['title'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'forms_get',
    description: 'Gets metadata and item summaries for a Google Form.',
    parameters: {
      type: 'OBJECT',
      properties: {
        formId: { type: 'STRING', description: 'Google Form id.' },
      },
      required: ['formId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'forms_add_question',
    description: 'Adds a text or choice question to a Google Form.',
    parameters: {
      type: 'OBJECT',
      properties: {
        formId: { type: 'STRING', description: 'Google Form id.' },
        title: { type: 'STRING', description: 'Question title.' },
        description: { type: 'STRING', description: 'Optional question description.' },
        required: { type: 'BOOLEAN', description: 'Whether the answer is required.' },
        paragraph: { type: 'BOOLEAN', description: 'For text questions, whether to use paragraph response.' },
        options: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Choice options. Omit for text question.' },
        choiceType: { type: 'STRING', description: 'RADIO, CHECKBOX, or DROP_DOWN. Default RADIO.' },
        index: { type: 'INTEGER', description: 'Insertion index. Default 0.' },
      },
      required: ['formId', 'title'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'forms_list_responses',
    description: 'Lists submitted responses for a Google Form.',
    parameters: {
      type: 'OBJECT',
      properties: {
        formId: { type: 'STRING', description: 'Google Form id.' },
        limit: { type: 'INTEGER', description: 'Maximum responses to return, 1-100. Default 20.' },
        after: { type: 'STRING', description: 'Optional ISO timestamp; only responses submitted at/after this time are returned.' },
      },
      required: ['formId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'translate_text',
    description: 'Translates text using Google Cloud Translation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text to translate.' },
        texts: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Optional multiple texts to translate.' },
        target: { type: 'STRING', description: 'Target language code, e.g. "nl", "fr", "en", "tl".' },
        source: { type: 'STRING', description: 'Optional source language code.' },
        format: { type: 'STRING', description: 'text or html. Default text.' },
      },
      required: ['target'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'translate_detect_language',
    description: 'Detects the source language for text using Google Cloud Translation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: { type: 'STRING', description: 'Text to detect.' },
        texts: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Optional multiple texts to detect.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'chat_list_spaces',
    description: 'Lists Google Chat spaces visible to the signed-in user. Use this before sending a message if the user named a space but did not provide the space id.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Optional client-side filter for space name/display name.' },
        limit: { type: 'INTEGER', description: 'Maximum spaces to return, 1-100. Default 20.' },
        pageToken: { type: 'STRING', description: 'Optional pagination token.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'chat_list_messages',
    description: 'Lists recent messages in a Google Chat space.',
    parameters: {
      type: 'OBJECT',
      properties: {
        space: { type: 'STRING', description: 'Space resource name, e.g. "spaces/AAAA...".' },
        limit: { type: 'INTEGER', description: 'Maximum messages to return, 1-100. Default 20.' },
        pageToken: { type: 'STRING', description: 'Optional pagination token.' },
      },
      required: ['space'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'chat_send_message',
    description: 'Sends a plain-text message to a Google Chat space.',
    parameters: {
      type: 'OBJECT',
      properties: {
        space: { type: 'STRING', description: 'Space resource name, e.g. "spaces/AAAA...".' },
        text: { type: 'STRING', description: 'Message body.' },
        thread: { type: 'STRING', description: 'Optional thread resource name.' },
        threadKey: { type: 'STRING', description: 'Optional thread key for grouped replies.' },
        messageReplyOption: { type: 'STRING', description: 'Optional Google Chat reply option.' },
      },
      required: ['space', 'text'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'youtube_search',
    description: 'Searches YouTube videos, channels, or playlists.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'YouTube search query.' },
        type: { type: 'STRING', description: 'video, channel, or playlist. Default video.' },
        limit: { type: 'INTEGER', description: 'Maximum results, 1-20. Default 6.' },
        regionCode: { type: 'STRING', description: 'Optional region code, e.g. "US", "BE", "PH".' },
        language: { type: 'STRING', description: 'Optional relevance language code.' },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'youtube_video_details',
    description: 'Gets metadata, duration, and statistics for a YouTube video.',
    parameters: {
      type: 'OBJECT',
      properties: {
        videoId: { type: 'STRING', description: 'YouTube video id.' },
      },
      required: ['videoId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'youtube_channel_info',
    description: 'Gets metadata and recent uploads for a YouTube channel.',
    parameters: {
      type: 'OBJECT',
      properties: {
        channelId: { type: 'STRING', description: 'YouTube channel id.' },
        handle: { type: 'STRING', description: 'YouTube handle, e.g. "@Google".' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'youtube_trending',
    description: 'Lists trending YouTube videos for a region.',
    parameters: {
      type: 'OBJECT',
      properties: {
        regionCode: { type: 'STRING', description: 'Region code, e.g. "US", "BE", "PH". Default US.' },
        limit: { type: 'INTEGER', description: 'Maximum videos, 1-25. Default 8.' },
        categoryId: { type: 'STRING', description: 'Optional YouTube video category id.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'youtube_playlist_items',
    description: 'Lists videos in a YouTube playlist.',
    parameters: {
      type: 'OBJECT',
      properties: {
        playlistId: { type: 'STRING', description: 'YouTube playlist id.' },
        limit: { type: 'INTEGER', description: 'Maximum items, 1-50. Default 15.' },
      },
      required: ['playlistId'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'youtube_status',
    description: 'Checks whether the configured YouTube Data API key is reachable.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'meet_schedule',
    description: 'Generates a Google Meet link and schedules a video call.',
    parameters: {
      type: 'OBJECT',
      properties: {
        attendees: { type: 'STRING', description: 'Comma-separated list of attendee email addresses.' },
        time: { type: 'STRING', description: 'The time for the meeting in ISO 8601 format.' }
      },
      required: ['time'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'set_reminder',
    description: 'Sets a reminder for the user by creating a calendar event.',
    parameters: {
      type: 'OBJECT',
      properties: {
        task: { type: 'STRING', description: 'The task or reminder text.' },
        time: { type: 'STRING', description: 'The time for the reminder in ISO 8601 format.' },
      },
      required: ['task'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'maps_navigate',
    description: 'Gets navigation directions from Google Maps.',
    parameters: {
      type: 'OBJECT',
      properties: {
        destination: { type: 'STRING', description: 'The destination address or place name.' },
        origin: { type: 'STRING', description: 'The starting location.' }
      },
      required: ['destination'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'image_generate',
    description: 'Generates an AI image from a descriptive prompt and places the result in Beatrice\'s voice workspace. Use this when the user asks Beatrice to create, generate, or design an image.',
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: {
          type: 'STRING',
          description: 'Detailed image prompt including subject, style, lighting, composition, colors, and any text that should appear.',
        },
        aspectRatio: {
          type: 'STRING',
          description: 'Optional output aspect ratio: "1:1", "3:4", "4:3", "9:16", or "16:9". Default "1:1".',
        },
        negativePrompt: {
          type: 'STRING',
          description: 'Optional things to avoid in the image.',
        },
        numberOfImages: {
          type: 'INTEGER',
          description: 'Optional number of images to generate, from 1 to 4. Default 1.',
        },
      },
      required: ['prompt'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'video_generate',
    description: 'Generates a high-quality HeyGen AI video from a descriptive text prompt. Use this during voice conversations when the user asks Beatrice to create, render, or generate a video.',
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'Detailed video prompt, including presenter topic, audience, tone, duration, language, and visual style.' },
        mode: { type: 'STRING', description: 'HeyGen Video Agent mode: "generate" for one-shot rendering or "chat" for multi-turn review. Default "generate".' },
        orientation: { type: 'STRING', description: 'Optional video orientation: "landscape" or "portrait".' },
        avatarId: { type: 'STRING', description: 'Optional HeyGen avatar/look id.' },
        voiceId: { type: 'STRING', description: 'Optional HeyGen voice id.' },
        styleId: { type: 'STRING', description: 'Optional HeyGen Video Agent style id.' },
        incognitoMode: { type: 'BOOLEAN', description: 'Optional: disables HeyGen memory injection/extraction for the session.' },
      },
      required: ['prompt'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'video_status',
    description: 'Checks the status of a HeyGen video generation job by sessionId or videoId. Use this when a HeyGen render is already running.',
    parameters: {
      type: 'OBJECT',
      properties: {
        sessionId: { type: 'STRING', description: 'HeyGen Video Agent session id.' },
        videoId: { type: 'STRING', description: 'HeyGen video id.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'video_list_sessions',
    description: 'Lists recent HeyGen Video Agent sessions for the authenticated HeyGen account, sorted newest-first. Use when the user asks for recent, previous, or existing HeyGen video agent sessions.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'INTEGER', description: 'Results per page, 1-100. Default 20.' },
        token: { type: 'STRING', description: 'Optional pagination cursor from nextToken / next_token.' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'vision_detect_objects',
    description: 'Runs real object detection on the latest image or CCTV frame and returns YOLO-style boxes, labels, confidence scores, and potential threat flags.',
    parameters: {
      type: 'OBJECT',
      properties: {
        imageDataUrl: {
          type: 'STRING',
          description: 'Optional data URL for an image frame. If omitted, Beatrice uses the latest captured CCTV/camera frame.',
        },
        sourceLabel: {
          type: 'STRING',
          description: 'Human-readable source name, such as "front gate camera" or "uploaded invoice photo".',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'vision_video_camera_open',
    description: 'Opens the normal browser video camera for live vision. Beatrice can use this to show YOLO-style boxes, labels, confidence scores, threat flags, and realtime OCR preview from a phone or desktop camera.',
    parameters: {
      type: 'OBJECT',
      properties: {
        sourceLabel: {
          type: 'STRING',
          description: 'Human-readable camera label, such as "phone rear camera", "desk camera", or "front gate view".',
        },
        autoDetect: {
          type: 'BOOLEAN',
          description: 'Whether to automatically run live object detection and OCR once the camera opens. Default true.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vision_take_photo',
    description: 'Opens the phone camera/native photo picker so the user can take or upload an image. After capture Beatrice can detect objects, draw boxes/labels, and OCR readable text.',
    parameters: {
      type: 'OBJECT',
      properties: {
        sourceLabel: {
          type: 'STRING',
          description: 'Human-readable source label, such as "phone camera photo" or "receipt photo".',
        },
        autoDetect: {
          type: 'BOOLEAN',
          description: 'Whether to run object detection and OCR immediately after image capture. Default true.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'vision_ocr_latest_frame',
    description: 'Runs OCR on the latest captured camera, photo, CCTV, or uploaded image frame and returns readable text plus OCR confidence and language.',
    parameters: {
      type: 'OBJECT',
      properties: {
        imageDataUrl: {
          type: 'STRING',
          description: 'Optional image data URL. If omitted, Beatrice uses the latest captured frame.',
        },
        sourceLabel: {
          type: 'STRING',
          description: 'Human-readable source label for the OCR result.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'vision_cctv_monitor_start',
    description: 'Opens a CCTV/IP camera monitor and repeatedly scans browser-readable frames for objects, boxes, labels, and potential threat flags. Supports HTTP snapshot, MJPEG, HLS, MP4, or other browser-readable feeds; RTSP needs a gateway.',
    parameters: {
      type: 'OBJECT',
      properties: {
        streamUrl: {
          type: 'STRING',
          description: 'Browser-readable CCTV feed URL, HTTP snapshot URL, MJPEG URL, HLS URL, or MP4 stream URL.',
        },
        sourceLabel: {
          type: 'STRING',
          description: 'Camera label, such as "warehouse entrance" or "front gate".',
        },
        intervalMs: {
          type: 'INTEGER',
          description: 'Detection interval in milliseconds. Default 3000.',
        },
      },
      required: ['streamUrl'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'vision_cctv_monitor_stop',
    description: 'Stops the active CCTV object-detection monitor.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'eburonflix_browse',
    description: 'Open EburonFlix and browse the catalog. Use when the user asks to see popular movies, top rated, new releases, Tagalog films, or to filter by genre.',
    parameters: {
      type: 'OBJECT',
      properties: {
        mediaType: { type: 'STRING', description: 'Either "movie" or "tv". Defaults to "movie".' },
        category: { type: 'STRING', description: 'One of "popular", "new_released", "top_rated", or "tagalog". Defaults to "popular".' },
        genre: { type: 'STRING', description: 'Optional genre name like "Action", "Comedy", "Romance".' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'eburonflix_search',
    description: 'Search EburonFlix for movies, TV shows, or actors by name. Returns top matches with title, year, and rating so Beatrice can describe them.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'The search term — title, actor name, or keyword.' },
        limit: { type: 'INTEGER', description: 'Max results to summarise (default 5, max 10).' },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'eburonflix_play',
    description: 'Open the EburonFlix player and start streaming a movie or TV episode. Pass either a TMDB id or a title to resolve via search.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the movie or TV show to play.' },
        tmdbId: { type: 'INTEGER', description: 'Optional explicit TMDB id when known.' },
        mediaType: { type: 'STRING', description: 'Either "movie" or "tv". Defaults to "movie".' },
        season: { type: 'INTEGER', description: 'For TV: season number, default 1.' },
        episode: { type: 'INTEGER', description: 'For TV: episode number, default 1.' },
        server: { type: 'STRING', description: 'Optional source: "vidsrc.net", "vidsrc.in", "vidsrc.pm", or "vidsrc.xyz".' },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'eburonflix_translate',
    description: 'Translate the EburonFlix synopsis or actor biography into another language using TMDB translations.',
    parameters: {
      type: 'OBJECT',
      properties: {
        tmdbId: { type: 'INTEGER', description: 'TMDB id of the movie, TV show, or person.' },
        mediaType: { type: 'STRING', description: 'One of "movie", "tv", or "person".' },
        language: { type: 'STRING', description: 'Target language: English name (e.g. "Dutch", "Tagalog", "Spanish") or ISO 639-1 code.' },
      },
      required: ['tmdbId', 'mediaType', 'language'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'eburonflix_close',
    description: 'Close the EburonFlix overlay and return the user to the previous Beatrice view.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'remember_this',
    description: 'Saves an important fact, preference, event, or personal detail about the current user into Beatrice\'s long-term conversation memory. Call this when the user says "remember this" / "save this" / "don\'t forget", or when Beatrice notices something important about the user during conversation (a preference, a life event, a personal detail, a goal, etc.). Memories are unique per user and persist across sessions.',
    parameters: {
      type: 'OBJECT',
      properties: {
        fact: {
          type: 'STRING',
          description: 'The fact, preference, event, or personal detail to remember. Use clear, specific wording like "Sarah prefers to be called by her first name" or "User is planning a trip to Japan next month".',
        },
        category: {
          type: 'STRING',
          description: 'Category of the memory: "preference", "personal", "fact", "event", "goal", "instruction", or "general". Default "general".',
        },
        importance: {
          type: 'STRING',
          description: 'How important this memory is: "low", "medium", "high", or "critical". Default "medium".',
        },
      },
      required: ['fact'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'remember_that',
    description: 'Shorthand version of remember_this — saves a personal detail about the current user into long-term conversation memory. Use when the user says "remember that I..." or "remember that about me...".',
    parameters: {
      type: 'OBJECT',
      properties: {
        fact: {
          type: 'STRING',
          description: 'The personal detail to remember about the user.',
        },
        category: {
          type: 'STRING',
          description: 'Category: "preference", "personal", "fact", "event", "goal", "instruction", or "general". Default "personal".',
        },
        importance: {
          type: 'STRING',
          description: '"low", "medium", "high", or "critical". Default "medium".',
        },
      },
      required: ['fact'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'conversation_memory_search',
    description: 'Searches Beatrice\'s long-term conversation memories for facts, preferences, or events that match a query. Use when the user asks "what do you remember about me?" or "do you remember when..." or when you need to recall something you saved earlier.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Natural language search query to find relevant memories.',
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of matching memories to return. Default 5, max 10.',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'conversation_memory_recent',
    description: 'Retrieves the most recent or most frequently accessed conversation memories for the current user. Use when the user asks "what do you know about me?" or to remind yourself of important user context.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of memories to return. Default 10. Max 20.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'conversation_memory_forget',
    description: 'Forgets/deletes a specific conversation memory. Use when the user says "forget that" or "never mind, don\'t remember that" or "remove that from your memory".',
    parameters: {
      type: 'OBJECT',
      properties: {
        fact: {
          type: 'STRING',
          description: 'The fact or memory to forget, described in natural language.',
        },
        memoryId: {
          type: 'STRING',
          description: 'Optional explicit memory id to forget.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'knowledge_base_list',
    description: 'Lists every document in Beatrice\'s permanent knowledge base (the /files folder — Eburon business plan, financial plan, etc.). Use when the user asks "what files do you know?", "what\'s in your knowledge base?", or before answering questions that may be grounded in those documents.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'knowledge_base_search',
    description: 'Searches Beatrice\'s permanent knowledge base (the /files folder — Eburon business plan, financial plan, etc.) for content matching a query. Use this to ground answers about Eburon, the business plan, financial projections, hypotheses, sales/clients/products, or anything that should come from the official source documents instead of being guessed.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Natural language query, in any language. The search runs over the full document text.',
        },
        limit: {
          type: 'INTEGER',
          description: 'Maximum number of matching documents to return. Default 3, max 8.',
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'knowledge_base_get',
    description: 'Fetches the text of a specific document from Beatrice\'s permanent knowledge base by id or title (e.g. "Eburon Financial Plan v8"). Use after knowledge_base_search when the user wants details from one specific file.',
    parameters: {
      type: 'OBJECT',
      properties: {
        idOrTitle: {
          type: 'STRING',
          description: 'Document id (from knowledge_base_search) or a title fragment.',
        },
        maxChars: {
          type: 'INTEGER',
          description: 'Cap on returned characters. Default 3500.',
        },
      },
      required: ['idOrTitle'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'whatsapp_send_message',
    description: 'Send a WhatsApp message via the user\'s configured WhatsApp Business account (Meta Cloud API). Use when the user says "WhatsApp X to ...", "send a WhatsApp", "text on WhatsApp", or asks Beatrice to forward something via WhatsApp. If WhatsApp is not configured, suggest opening Settings → Integration. Per-user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        message: {
          type: 'STRING',
          description: 'The full message body to send. Up to 4096 characters.',
        },
        to: {
          type: 'STRING',
          description: 'Recipient phone number in E.164 format (e.g. "+32475123456"). If omitted, uses the configured default recipient.',
        },
        previewUrl: {
          type: 'BOOLEAN',
          description: 'Whether WhatsApp should render a preview for the first URL in the message body. Default false.',
        },
      },
      required: ['message'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'whatsapp_send_template',
    description: 'Send a pre-approved WhatsApp template message (required for messages outside the 24-hour customer-service window). Use only when the user names a template they have approved in Meta Business Manager.',
    parameters: {
      type: 'OBJECT',
      properties: {
        templateName: {
          type: 'STRING',
          description: 'Approved template name as it appears in Meta Business Manager.',
        },
        languageCode: {
          type: 'STRING',
          description: 'Language code for the template, e.g. "en", "fr", "nl". Default "en".',
        },
        to: {
          type: 'STRING',
          description: 'Recipient phone number, E.164. Falls back to default recipient.',
        },
        variables: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Ordered values for the template body placeholders ({{1}}, {{2}}, …).',
        },
      },
      required: ['templateName'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'whatsapp_status',
    description: 'Reports whether WhatsApp is configured for the current user (Phone Number ID + access token present). Useful before suggesting a send.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'zapier_trigger',
    description: 'Trigger one of the user\'s registered Zapier zaps (Catch Hook webhooks). Use when the user asks Beatrice to do something that maps to a wired-up zap, such as "send to Slack", "log this to Sheets", "post on Twitter", "save to Notion", or anything that integrates through the user\'s Zapier account. Call zapier_list_zaps first if you don\'t know what\'s available.',
    parameters: {
      type: 'OBJECT',
      properties: {
        zap: {
          type: 'STRING',
          description: 'Name or id of the zap to trigger (matches what is shown in zapier_list_zaps).',
        },
        payload: {
          type: 'OBJECT',
          description: 'Optional structured JSON payload sent to the zap. If omitted, any other args (except zap/name/id) are forwarded as a flat object.',
        },
      },
      required: ['zap'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'zapier_list_zaps',
    description: 'Lists every Zapier zap the user has registered with Beatrice (name + description + expected params). Useful before answering "what can you do with Zapier?" or before triggering one.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'zapier_status',
    description: 'Reports whether any Zapier zaps are configured.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
  {
    name: 'conversation_history_recall',
    description: 'Fetches a fresh summary of this user\'s past conversations with Beatrice (long-term conversation history, recorded automatically per-user). Use when the user asks "what did we talk about last time?", "do you remember what we discussed before?", "what was that thing we were working on?", or any time you need to refresh your memory of prior sessions beyond what was injected at session start.',
    parameters: {
      type: 'OBJECT',
      properties: {
        forceRefresh: {
          type: 'BOOLEAN',
          description: 'When true, regenerates the digest from raw turns even if a cached one exists. Default false.',
        },
      },
      required: [],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.WHEN_IDLE,
  },
];
