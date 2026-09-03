import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'XRISEAI Mini Helpdesk API',
    version: '1.0.0',
    description:
      'Production-ready Customer Support & Ticket Management API with JWT Authentication, Gemini AI Triage, and Cloudinary File Attachments.',
    contact: {
      name: 'XRISEAI Engineering Support',
      email: 'adityaa.sharma183@gmail.com',
    },
  },
  servers: [
    {
      url: env.API_BASE_URL || `http://localhost:${env.PORT}`,
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Health', description: 'System health and uptime telemetry' },
    { name: 'Auth', description: 'Staff authentication, login, and session tokens' },
    { name: 'Public Tickets', description: 'Unauthenticated customer ticket submission and status tracking' },
    { name: 'Tickets', description: 'Protected agent and admin ticket management' },
    { name: 'Agents', description: 'Staff roster and administrative management' },
    { name: 'AI Assistant', description: 'Gemini AI ticket classification, summaries, and reply drafts' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT bearer token obtained via POST /api/auth/login.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request payload.' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
      Attachment: {
        type: 'object',
        properties: {
          publicId: { type: 'string', example: 'mini-helpdesk/attachments/sample_doc_123' },
          url: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/sample.pdf' },
          name: { type: 'string', example: 'error_screenshot.png' },
          size: { type: 'number', example: 1048576 },
          mimeType: { type: 'string', example: 'image/png' },
          format: { type: 'string', example: 'png' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '67c5a3e1b4f2c00012345678' },
          name: { type: 'string', example: 'Aarav Sharma' },
          email: { type: 'string', example: 'agent1@xriseai.com' },
          role: { type: 'string', enum: ['ADMIN', 'AGENT'], example: 'AGENT' },
          isActive: { type: 'boolean', example: true },
          avatar: { type: 'string', nullable: true, example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'agent1@xriseai.com' },
          password: { type: 'string', example: 'agent1@123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            },
          },
        },
      },
      PublicTicketRequest: {
        type: 'object',
        required: ['name', 'email', 'subject', 'body'],
        properties: {
          name: { type: 'string', example: 'Sarah Connor' },
          email: { type: 'string', format: 'email', example: 'sarah@example.com' },
          subject: { type: 'string', example: 'Unable to connect custom domain' },
          body: { type: 'string', example: 'DNS records configured but SSL handshake is timing out.' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM', example: 'HIGH' },
          attachments: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: 'Optional file attachments (up to 5 files, 10MB each: JPEG, PNG, WEBP, PDF, TXT, CSV, DOCX).',
          },
        },
      },
      PublicTicketResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              ticketId: { type: 'string', example: 'XR-9A2K4B' },
              subject: { type: 'string', example: 'Unable to connect custom domain' },
            },
          },
        },
      },
      PublicStatusRequest: {
        type: 'object',
        required: ['ticketId', 'email'],
        properties: {
          ticketId: { type: 'string', example: 'XR-9A2K4B' },
          email: { type: 'string', format: 'email', example: 'sarah@example.com' },
        },
      },
      PublicStatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              ticketId: { type: 'string', example: 'XR-9A2K4B' },
              subject: { type: 'string', example: 'Unable to connect custom domain' },
              status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'IN_PROGRESS' },
              priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'HIGH' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              latestReply: {
                type: 'object',
                nullable: true,
                properties: {
                  senderName: { type: 'string', example: 'Aarav Sharma' },
                  senderType: { type: 'string', example: 'AGENT' },
                  body: { type: 'string', example: 'We have updated your CNAME routing certificate.' },
                  createdAt: { type: 'string', format: 'date-time' },
                  attachments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Attachment' },
                  },
                },
              },
            },
          },
        },
      },
      CreateInternalTicketRequest: {
        type: 'object',
        required: ['name', 'email', 'subject', 'body'],
        properties: {
          name: { type: 'string', example: 'Maya Chen' },
          email: { type: 'string', format: 'email', example: 'maya@example.com' },
          subject: { type: 'string', example: 'SSO Integration assistance' },
          body: { type: 'string', example: 'Need help linking Okta SAML certificate.' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
          assigneeId: {
            type: 'string',
            description: 'Optional agent user ID, or "round-robin" for automated workload distribution.',
            example: 'round-robin',
          },
          attachments: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
          },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '67c5a3e1b4f2c00012345690' },
          ticketId: { type: 'string', example: 'XR-9A2K4B' },
          customer: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Sarah Connor' },
              email: { type: 'string', example: 'sarah@example.com' },
            },
          },
          subject: { type: 'string', example: 'Unable to connect custom domain' },
          body: { type: 'string', example: 'DNS records configured but SSL handshake is timing out.' },
          status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'OPEN' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], example: 'HIGH' },
          assignee: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: 'Aarav Sharma' },
              email: { type: 'string', example: 'agent1@xriseai.com' },
              role: { type: 'string', example: 'AGENT' },
            },
          },
          messageCount: { type: 'number', example: 1 },
          lastReplyAt: { type: 'string', format: 'date-time', nullable: true },
          attachments: {
            type: 'array',
            items: { $ref: '#/components/schemas/Attachment' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TicketTimeline: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                senderName: { type: 'string' },
                senderType: { type: 'string', enum: ['CUSTOMER', 'AGENT'] },
                body: { type: 'string' },
                attachments: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Attachment' },
                },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string', example: 'STATUS_CHANGED' },
                actor: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                metadata: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      AddReplyRequest: {
        type: 'object',
        required: ['body'],
        properties: {
          body: { type: 'string', example: 'Thank you for reaching out. We have resolved the DNS certificate issue.' },
          attachments: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
          },
        },
      },
      UpdateStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'RESOLVED' },
        },
      },
      ReassignTicketRequest: {
        type: 'object',
        required: ['assigneeId'],
        properties: {
          assigneeId: { type: 'string', example: '67c5a3e1b4f2c00012345678' },
        },
      },
      AiAnalyzeResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              category: { type: 'string', example: 'Technical' },
              suggestedPriority: { type: 'string', example: 'HIGH' },
              sentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'], example: 'NEUTRAL' },
              sentimentScore: { type: 'number', example: 0.5 },
              confidenceScore: { type: 'number', example: 0.95 },
              keyEntities: { type: 'array', items: { type: 'string' }, example: ['SSL', 'DNS', 'Domain'] },
              summarySnippet: { type: 'string', example: 'Customer cannot connect domain due to SSL timeout.' },
              reasoning: { type: 'string', example: 'High urgency indicated by DNS communication failure.' },
            },
          },
        },
      },
      AiSummaryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              mainProblem: { type: 'string', example: 'Domain SSL handshake timing out during lookup.' },
              keyContext: { type: 'string', example: 'Customer updated DNS records 2 hours ago.' },
              currentState: { type: 'string', example: 'Support engineer investigating certificate propagation.' },
              suggestedNextStep: { type: 'string', example: 'Verify CNAME records and trigger cert renewal.' },
            },
          },
        },
      },
      AiDraftResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              draft: { type: 'string', example: 'Hi Sarah, thank you for contacting XRISE Support...' },
              tone: { type: 'string', example: 'Professional and empathetic' },
              confidence: { type: 'number', example: 0.92 },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API and database health',
        description: 'Returns real-time telemetry, service uptime, and MongoDB connectivity status.',
        responses: {
          200: {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        service: { type: 'string', example: 'mini-helpdesk-api' },
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number', example: 120.45 },
                        database: { type: 'string', example: 'connected' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in to staff portal',
        description: 'Authenticates staff account with email and password, returning user data and JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Authenticated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Sign out and clear session',
        description: 'Clears the authentication session and HttpOnly cookie.',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'Logged out successfully.' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        description: 'Fetches active user profile from verified JWT token.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/public/tickets': {
      post: {
        tags: ['Public Tickets'],
        summary: 'Submit a public support ticket',
        description: 'Allows customers to log a support request with optional file attachments (multipart/form-data).',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/PublicTicketRequest' },
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'body'],
                properties: {
                  name: { type: 'string', example: 'Sarah Connor' },
                  email: { type: 'string', format: 'email', example: 'sarah@example.com' },
                  subject: { type: 'string', example: 'Unable to connect custom domain' },
                  body: { type: 'string', example: 'DNS records configured but SSL handshake is timing out.' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Ticket created and indexed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicTicketResponse' },
              },
            },
          },
          400: {
            description: 'Validation or file type error',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/public/tickets/status': {
      post: {
        tags: ['Public Tickets'],
        summary: 'Lookup public ticket status',
        description: 'Enables customers to check live progress, priority, and verified replies using Ticket ID and associated email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PublicStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Ticket status telemetry',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicStatusResponse' },
              },
            },
          },
          404: {
            description: 'Ticket not found or email mismatch',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'List tickets with filtering & pagination',
        description: 'Returns tickets scoped to authenticated agent (or all tickets for administrators).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated tickets list and summary stats',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tickets: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'number' },
                            limit: { type: 'number' },
                            total: { type: 'number' },
                            totalPages: { type: 'number' },
                          },
                        },
                        stats: {
                          type: 'object',
                          properties: {
                            total: { type: 'number' },
                            open: { type: 'number' },
                            inProgress: { type: 'number' },
                            resolved: { type: 'number' },
                            closed: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Create an internal support ticket / task',
        description: 'Staff ticket intake with direct agent assignment or round-robin auto-distribution.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateInternalTicketRequest' },
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'body'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  subject: { type: 'string' },
                  body: { type: 'string' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                  assigneeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Internal ticket created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/tickets/{ticketId}': {
      get: {
        tags: ['Tickets'],
        summary: 'Get ticket details by ID',
        description: 'Fetches full ticket record by unique ticketId (e.g. XR-9A2K4B) with RBAC authorization.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        responses: {
          200: {
            description: 'Ticket details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden (Agent not assigned to this ticket)' },
          404: { description: 'Ticket not found' },
        },
      },
    },
    '/api/tickets/{ticketId}/timeline': {
      get: {
        tags: ['Tickets'],
        summary: 'Get conversation activity & audit timeline',
        description: 'Returns chronological messages, file attachments, and audit trail events for the ticket.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        responses: {
          200: {
            description: 'Timeline and audit history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TicketTimeline' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tickets/{ticketId}/replies': {
      post: {
        tags: ['Tickets'],
        summary: 'Post reply to ticket',
        description: 'Submits a staff response with optional attachments and updates ticket state.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/AddReplyRequest' },
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['body'],
                properties: {
                  body: { type: 'string', example: 'We have updated your configuration.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Reply posted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        body: { type: 'string' },
                        senderName: { type: 'string' },
                        senderType: { type: 'string' },
                        attachments: { type: 'array', items: { $ref: '#/components/schemas/Attachment' } },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tickets/{ticketId}/status': {
      patch: {
        tags: ['Tickets'],
        summary: 'Update ticket lifecycle status',
        description: 'Updates ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) and triggers email notifications upon resolution.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tickets/{ticketId}/assignee': {
      patch: {
        tags: ['Tickets'],
        summary: 'Reassign ticket to another agent (Admin only)',
        description: 'Allows administrators to transfer ticket ownership to any registered agent.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReassignTicketRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Ticket reassigned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Ticket' },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden (Admin role required)' },
        },
      },
    },
    '/api/tickets/{ticketId}/ai/analyze': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Smart ticket analysis & triage',
        description: 'Invokes Gemini AI to classify category, detect customer sentiment, extract key entities, and suggest priority.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        responses: {
          200: {
            description: 'AI Analysis Result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AiAnalyzeResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tickets/{ticketId}/ai/summarize': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Summarize ticket conversation history',
        description: 'Extracts main problem, key context, current state, and suggested next steps using Gemini AI.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        responses: {
          200: {
            description: 'AI Conversation Summary',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AiSummaryResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tickets/{ticketId}/ai/draft': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Generate AI reply draft',
        description: 'Drafts a personalized, empathetic response incorporating full conversation context without auto-posting (human-in-the-loop).',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' }, example: 'XR-9A2K4B' },
        ],
        responses: {
          200: {
            description: 'AI Draft Reply',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AiDraftResponse' },
              },
            },
          },
        },
      },
    },
    '/api/agents': {
      get: {
        tags: ['Agents'],
        summary: 'List staff roster (Admin only)',
        description: 'Returns all registered support staff and administrators with active status.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Staff list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden (Admin role required)' },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: [],
});
