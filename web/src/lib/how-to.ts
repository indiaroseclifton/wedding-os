export type HowAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type HowGuide = {
  id: string;
  title: string;
  href: string;
  steps: string[];
  actions?: HowAction[];
};

export const HOW_TO: HowGuide[] = [
  {
    id: "pinterest",
    title: "Link a Pinterest board",
    href: "/planning/vision",
    steps: [
      "On your phone or laptop, open Pinterest and sign in.",
      "Open the board that is actually for this wedding — not a general pretty board.",
      "Make it public: board → Edit → turn off Secret. A secret board will not show in Vision.",
      "Tap the address bar. Copy the whole link. It must look like pinterest.com/yourname/board-name/",
      "Come back to Vision. Paste that link in Board URL.",
      "Wait two seconds. Pins should appear. If they do not, you copied a pin, a search, or a secret board.",
      "Keep adding pins on Pinterest. This page only shows the board. It does not import pins into the moodboard yet.",
    ],
    actions: [
      { label: "Sign in to Pinterest", href: "https://www.pinterest.com/login/", external: true },
      { label: "Open Pinterest", href: "https://www.pinterest.com/", external: true },
      { label: "Paste on Vision", href: "/planning/vision" },
    ],
  },
  {
    id: "home",
    title: "Use This week",
    href: "/dashboard",
    steps: [
      "Open Home. This week is the list of what is actually due, not a dump of every task.",
      "Do the first kick item, then mark it done in Checklist so it leaves This week.",
      "If something urgent is missing, add it on Checklist with a date. Home will pick it up.",
      "Do not treat Home as a chat. It only shows work the desk already knows about.",
    ],
    actions: [{ label: "Open Home", href: "/dashboard" }],
  },
  {
    id: "notifications",
    title: "Use the bell",
    href: "/dashboard#attention",
    steps: [
      "Tap the bell on the mast, or jump to Attention on Home.",
      "That list is the same work as This week — overdue deposits, missing RSVPs, unlocked vision.",
      "Clear an item by doing the work in its room, not by dismissing the bell.",
    ],
    actions: [{ label: "Open Attention", href: "/dashboard#attention" }],
  },
  {
    id: "recommendations",
    title: "Get a next move",
    href: "/discover",
    steps: [
      "Open Discover after vision and place are set. Suggestions need a city and a feeling.",
      "Treat each card as a place to look — Maps, a shop, a florist — not a paid ad.",
      "If the city is wrong, fix location in Settings. Discover follows that, not a marketplace.",
    ],
    actions: [
      { label: "Open Discover", href: "/discover" },
      { label: "Open Settings", href: "/settings" },
    ],
  },
  {
    id: "shape-plan",
    title: "Set the shape of the day",
    href: "/planning",
    steps: [
      "Sit down with both of you. Decide: us two, a small room, a weekend, or two events.",
      "Open Plan and tap that shape once. Do not keep two shapes.",
      "Open Checklist. Aisle, processional, and extra-day tasks should hide if the shape does not need them.",
      "If the venue changes the shape later, come back here and tap the new one. Then walk the checklist again.",
    ],
    actions: [
      { label: "Open Plan", href: "/planning" },
      { label: "Open Checklist", href: "/checklist" },
    ],
  },
  {
    id: "vision",
    title: "Write the vision",
    href: "/planning/vision",
    steps: [
      "Gather three pictures you already like — phone camera roll or Pinterest.",
      "On Vision, walk This / not this, or skip to Brief if you already know the words.",
      "Pick vibe, how dressed, color story, and place. Write the hard nos (no mason jars, no sparkler exit).",
      "Link the Pinterest board at the top if the pictures live there.",
      "Lock it only when you would text this brief to a florist and mean it.",
    ],
    actions: [
      { label: "Open Vision", href: "/planning/vision" },
      { label: "Open Pinterest", href: "https://www.pinterest.com/", external: true },
    ],
  },
  {
    id: "moodboard",
    title: "Build the moodboard",
    href: "/moodboard",
    steps: [
      "Pull 8–12 pictures max. More than that and nobody can see the brief.",
      "Open Moodboard. Add each picture and tag why it stayed: light, table, dress, place, paper.",
      "Delete anything that is only pretty. Keep what you would actually put on a table.",
      "Share the board with the person who is making flowers or paper so they stop guessing.",
    ],
    actions: [{ label: "Open Moodboard", href: "/moodboard" }],
  },
  {
    id: "together",
    title: "Settle the calls that need both of you",
    href: "/together",
    steps: [
      "Open Together. These are the fights and the open calls — not the whole checklist.",
      "Pick one item. Sit in the same room. Decide hire or make, or pick a number.",
      "Mark it resolved. The desk should stop nagging that line.",
    ],
    actions: [{ label: "Open Together", href: "/together" }],
  },
  {
    id: "checklist",
    title: "Work the checklist",
    href: "/checklist",
    steps: [
      "Set the wedding date in Settings first. Dates on tasks follow that.",
      "Set the shape on Plan so aisle work is not sitting on a backyard lunch.",
      "Open Checklist. Do what is dated this month. Check it off when the real-world thing is done — deposit sent, suit ordered — not when you thought about it.",
      "Add a custom line only when the template missed something you actually have to do.",
    ],
    actions: [
      { label: "Open Checklist", href: "/checklist" },
      { label: "Open Plan", href: "/planning" },
    ],
  },
  {
    id: "timeline",
    title: "Build the planning timeline",
    href: "/timeline",
    steps: [
      "This is months, not the hour of the day. Day-of lives under Run of show.",
      "Open Timeline. Confirm book-by dates for venue, food, clothes, and paper.",
      "Move a milestone only when the vendor actually changed the deadline.",
    ],
    actions: [
      { label: "Open Timeline", href: "/timeline" },
      { label: "Open Run of show", href: "/run-of-show" },
    ],
  },
  {
    id: "decisions",
    title: "Close a decision",
    href: "/decisions",
    steps: [
      "Open Decisions. Pick the one that is blocking other work.",
      "Choose a path: hire or make. Write who owns it.",
      "If it is hire, add the vendor on Vendors the same day. If it is make, open Studio and start quantities.",
    ],
    actions: [
      { label: "Open Decisions", href: "/decisions" },
      { label: "Open Vendors", href: "/vendors" },
      { label: "Open Studio", href: "/studio" },
    ],
  },
  {
    id: "vendors",
    title: "Keep hired people",
    href: "/vendors",
    steps: [
      "When you hire someone, add them the day the deposit leaves — name, role, phone, email, what they are doing.",
      "Put the contract PDF in your Drive contracts folder and paste that folder on Folders later.",
      "Send them the packet from Handoffs when the day is close: run of show, floor, music, parking.",
    ],
    actions: [
      { label: "Open Vendors", href: "/vendors" },
      { label: "Open Handoffs", href: "/handoffs" },
    ],
  },
  {
    id: "vendor-search",
    title: "Find a vendor",
    href: "/vendors/browse",
    steps: [
      "Write the role you need: caterer, DJ, florist, photographer.",
      "Search Google Maps for that role plus your city. Read two recent reviews, not the star average.",
      "Ask one friend who had a wedding in that city for a name.",
      "When you pick one, add them on Vendors. Do not build a directory inside this desk.",
    ],
    actions: [
      { label: "Open Vendors", href: "/vendors" },
      { label: "Google Maps", href: "https://maps.google.com/", external: true },
    ],
  },
  {
    id: "venue-search",
    title: "Find a place",
    href: "/vendors",
    steps: [
      "Write musts: indoor/outdoor, guest count, city, budget for the room only.",
      "Search Maps and the city parks / historic-home sites. Walk two places before you fall in love on Instagram.",
      "Ask about rain plan, load-in, and whether you can bring your own food.",
      "When you book it, put address and rules on the guest site and in Travel.",
    ],
    actions: [
      { label: "Open Travel", href: "/travel" },
      { label: "Google Maps", href: "https://maps.google.com/", external: true },
    ],
  },
  {
    id: "local-ideas",
    title: "Find local ideas",
    href: "/discover",
    steps: [
      "Set city in Settings.",
      "Open Discover. Use it for flowers, cake, photo spots — then go look in person.",
      "Save a keeper on Vendors or Studio shop. Do not collect twenty maybes.",
    ],
    actions: [{ label: "Open Discover", href: "/discover" }],
  },
  {
    id: "guest-list",
    title: "Build the guest list",
    href: "/guests",
    steps: [
      "Start with households, not people. The Smiths are one row until someone RSVPs separately.",
      "Open Guests. Add name, household, address, plus-one rule, and diet if you already know it.",
      "Import from a spreadsheet if you have one: name, email, household, address.",
      "Lock the list before invitations go out. After that, adds are exceptions.",
    ],
    actions: [{ label: "Open Guests", href: "/guests" }],
  },
  {
    id: "events-rsvp",
    title: "Collect RSVPs",
    href: "/events",
    steps: [
      "Create each event guests must answer: ceremony, dinner, brunch.",
      "Put the RSVP link on the guest site. That is the only link you text people.",
      "When a paper card comes back, enter it on Guests the same day so the count stays true.",
      "Close RSVP on the date you printed. After that, it is a phone call.",
    ],
    actions: [
      { label: "Open Events", href: "/events" },
      { label: "Open Site", href: "/site" },
    ],
  },
  {
    id: "multi-event",
    title: "Run more than one event",
    href: "/events",
    steps: [
      "List the weekend on paper first: Friday dinner, Saturday ceremony, Sunday lunch.",
      "Open Events. Add each one with a time and who is invited — not everyone comes to everything.",
      "On each household, mark which events they are invited to.",
      "The guest site should show only the events that household can see.",
    ],
    actions: [{ label: "Open Events", href: "/events" }],
  },
  {
    id: "invitations",
    title: "Send invitations",
    href: "/site",
    steps: [
      "Finish the guest list and the date before you design anything.",
      "For digital: publish the guest site and text or email that one link.",
      "For paper: open Studio → Cards, download the CSV, Bulk Create in Canva, print or send to a shop.",
      "Mail paper six to eight weeks out. Digital can go the same week you lock the list.",
    ],
    actions: [
      { label: "Open Site", href: "/site" },
      { label: "Open Cards", href: "/studio/cards" },
      { label: "Open Canva", href: "https://www.canva.com/", external: true },
    ],
  },
  {
    id: "guest-site",
    title: "Publish the guest site",
    href: "/site",
    steps: [
      "Write the letter: when, where, dress, travel, RSVP, what not to do.",
      "Open Site. Put schedule and hotel on it. Do not invent a second website.",
      "Publish /w. Copy that link onto the invitation and into the family group text.",
      "Update the site when the hotel or time changes. Do not send a new link.",
    ],
    actions: [{ label: "Open Site", href: "/site" }],
  },
  {
    id: "seating",
    title: "Seat people",
    href: "/seating",
    steps: [
      "Wait until RSVPs are mostly in. Seating before that is fiction.",
      "Open Seating. Put households at tables. Keep people who should not meet off the same table.",
      "Open Floor and match table names to the picture.",
      "Print place cards from Floor / Cards the week of, after the last change.",
    ],
    actions: [
      { label: "Open Seating", href: "/seating" },
      { label: "Open Floor", href: "/floorplan" },
    ],
  },
  {
    id: "floor-print",
    title: "Draw the floor and print sheets",
    href: "/floorplan",
    steps: [
      "Ask the venue for a simple outline: doors, power, where the kitchen is.",
      "Open Floor. Drag tables, stage, bar, dance floor to match that outline.",
      "Name tables the same names as Seating.",
      "Print the table list and place-card sheet. Give one copy to catering and one to whoever is setting cards.",
    ],
    actions: [
      { label: "Open Floor", href: "/floorplan" },
      { label: "Open Seating", href: "/seating" },
    ],
  },
  {
    id: "travel",
    title: "Set hotels and room blocks",
    href: "/travel",
    steps: [
      "Pick one or two hotels near the venue. Call the hotel and ask for a courtesy block first.",
      "Courtesy block = they hold rooms, guests book their own. Guaranteed block = you are on the hook for unsold rooms. Prefer courtesy unless the hotel demands guaranteed.",
      "Get the booking code and cut-off date in writing.",
      "Open Travel. Save hotel name, code, cut-off. Put the same text on the guest site.",
      "If you do not have a hotel yet, search Booking or Hotels.com from the strip, then come back and save the one you chose.",
    ],
    actions: [
      { label: "Open Travel", href: "/travel" },
      { label: "Booking.com", href: "https://www.booking.com/", external: true },
      { label: "Hotels.com", href: "https://www.hotels.com/", external: true },
    ],
  },
  {
    id: "hotel-recs",
    title: "Recommend lodging",
    href: "/travel",
    steps: [
      "Choose two hotels at two prices, not seven.",
      "Write why: walking distance, parking, breakfast.",
      "Put both on the guest site. People will book the first one you list, so list the one you mean.",
    ],
    actions: [{ label: "Open Travel", href: "/travel" }],
  },
  {
    id: "invite-users",
    title: "Invite family to the desk",
    href: "/settings",
    steps: [
      "Decide who may edit vs who may only look. Mom on the guest list is different from a planner on vendors.",
      "Open Settings. Send an invite to their email when that door exists. Until then, sit together on one login.",
      "Tell them This week is the list. They should not invent a parallel spreadsheet.",
    ],
    actions: [{ label: "Open Settings", href: "/settings" }],
  },
  {
    id: "invite-vendors",
    title: "Get a packet to a vendor",
    href: "/send",
    steps: [
      "Finish run of show, floor, and music first. An empty packet wastes their time.",
      "Open Send / Handoffs. Pick the vendor. Send email with the packet link.",
      "Text them once: the link and your phone. Do not build a second portal until they ask for more.",
    ],
    actions: [
      { label: "Open Send", href: "/send" },
      { label: "Open Handoffs", href: "/handoffs" },
    ],
  },
  {
    id: "guest-comms",
    title: "Write to guests",
    href: "/site",
    steps: [
      "Change the guest site first. That is the letter.",
      "Then send one email or text with the same link. Do not invent a newsletter.",
      "Week-of: one reminder with parking and time. Day-of: only if the plan broke.",
    ],
    actions: [{ label: "Open Site", href: "/site" }],
  },
  {
    id: "vendor-comms",
    title: "Write to vendors",
    href: "/handoffs",
    steps: [
      "One packet, one send. Do not drip five PDFs over five weeks.",
      "Open Handoffs. Attach run of show, floor, music, parking, contact on site.",
      "Call only for a change after that packet went out.",
    ],
    actions: [{ label: "Open Handoffs", href: "/handoffs" }],
  },
  {
    id: "studio",
    title: "Open Studio",
    href: "/studio",
    steps: [
      "Lock vision first so quantities have a color and a density.",
      "Open Studio. Pick the project that is actually due this month — flowers, table, or paper.",
      "Work quantities until you can buy. Then use Shop.",
    ],
    actions: [{ label: "Open Studio", href: "/studio" }],
  },
  {
    id: "flowers",
    title: "Plan flowers",
    href: "/diy/studio/floral",
    steps: [
      "Count tables, boutonnieres, and what stands at the door.",
      "Open Floral. Set stems and recipes to those counts.",
      "Buy from the grocery or wholesaler the week of. Put the spend on Budget.",
    ],
    actions: [
      { label: "Open Floral", href: "/diy/studio/floral" },
      { label: "Open Shop", href: "/studio/shop" },
    ],
  },
  {
    id: "tables",
    title: "Plan the table",
    href: "/diy/studio/table",
    steps: [
      "Count covers — seats, not households.",
      "Open Table. Set plates, glasses, linen, candles.",
      "Decide rent vs buy. Rentals go on Vendors. Buys go through Shop.",
    ],
    actions: [{ label: "Open Table", href: "/diy/studio/table" }],
  },
  {
    id: "cards",
    title: "Make cards in Canva",
    href: "/studio/cards",
    steps: [
      "Finish names and table numbers on Seating first.",
      "Open Cards. Download the CSV for place cards or menus.",
      "In Canva: Create a design the size of the card → Apps → Bulk Create → upload the CSV → connect name / table columns → Generate.",
      "Print at home on card stock, or send the PDF to a shop. Cut and box them by table.",
    ],
    actions: [
      { label: "Open Cards", href: "/studio/cards" },
      { label: "Open Canva", href: "https://www.canva.com/", external: true },
    ],
  },
  {
    id: "menus-programs",
    title: "Make menus and programs",
    href: "/studio/cards",
    steps: [
      "Get the final menu from catering in writing. Get the order of service from whoever is speaking.",
      "Open Cards. Use the menu / program CSV.",
      "Bulk Create in Canva the same way as place cards. Print two extras per table.",
    ],
    actions: [
      { label: "Open Cards", href: "/studio/cards" },
      { label: "Open Canva", href: "https://www.canva.com/", external: true },
    ],
  },
  {
    id: "signs",
    title: "Make signs",
    href: "/studio/signage",
    steps: [
      "List the signs you actually need: welcome, cards-and-gifts, restrooms, bar.",
      "Open Signage. Pick a size. Export to Canva or a cut file for Cricut.",
      "Print foam-board at a copy shop if you do not have a cutter. Make stands the day before.",
    ],
    actions: [
      { label: "Open Signage", href: "/studio/signage" },
      { label: "Open Canva", href: "https://www.canva.com/", external: true },
    ],
  },
  {
    id: "studio-buy",
    title: "Buy Studio supplies",
    href: "/studio/shop",
    steps: [
      "Finish quantities in Floral or Table so you are not guessing.",
      "Open Shop. Use Amazon for speed, Alibaba for volume with time, grocery for flowers this week.",
      "Check out on that site. Come back and log the spend on Budget the same day.",
    ],
    actions: [
      { label: "Open Shop", href: "/studio/shop" },
      { label: "Amazon", href: "https://www.amazon.com/", external: true },
      { label: "Alibaba", href: "https://www.alibaba.com/", external: true },
    ],
  },
  {
    id: "buy-ebay-temu",
    title: "Buy on eBay or Temu",
    href: "/studio/shop",
    steps: [
      "Only use these when the thing is cheap, replaceable, and you have weeks to spare.",
      "Search the item. Check shipping date against the wedding date plus a week.",
      "Log the order on Budget. Keep the tracking in your email, not in this desk.",
    ],
    actions: [
      { label: "eBay", href: "https://www.ebay.com/", external: true },
      { label: "Temu", href: "https://www.temu.com/", external: true },
    ],
  },
  {
    id: "inventory",
    title: "Box what you made",
    href: "/studio/inventory",
    steps: [
      "After the day, pile everything on one table.",
      "Open Inventory. Mark keep, sell, donate, or return for each box.",
      "Returns have dates — put those on After as well.",
    ],
    actions: [
      { label: "Open Inventory", href: "/studio/inventory" },
      { label: "Open After", href: "/after" },
    ],
  },
  {
    id: "print-mass",
    title: "Print a lot of paper",
    href: "/studio/cards",
    steps: [
      "Export PDFs from Canva or Cards.",
      "Under 50 sheets: home printer, card stock, a paper cutter.",
      "Over 50: a copy shop or Printful. Upload the PDF. Order 10% extra.",
      "Number the boxes by table before you leave the shop.",
    ],
    actions: [
      { label: "Open Cards", href: "/studio/cards" },
      { label: "Printful", href: "https://www.printful.com/", external: true },
    ],
  },
  {
    id: "print-photos",
    title: "Print photos",
    href: "/studio",
    steps: [
      "Pick the set — guest candids or the thank-you picture — and crop them first.",
      "Use a lab you already know (mpix, Artifact Uprising, local) or a drugstore for volume.",
      "Thank-you prints go with the card. Guest prints go in a box on After.",
    ],
    actions: [{ label: "Open After", href: "/after" }],
  },
  {
    id: "day-of",
    title: "Run the live desk",
    href: "/day-of",
    steps: [
      "The morning of, open Day-of on a phone that stays charged.",
      "Give the same view to one other person — not five.",
      "Check off cues as they happen. If a cue moves, change Run of show, do not whisper it.",
    ],
    actions: [
      { label: "Open Day-of", href: "/day-of" },
      { label: "Open Run of show", href: "/run-of-show" },
    ],
  },
  {
    id: "run-of-show",
    title: "Write the hour",
    href: "/run-of-show",
    steps: [
      "Start from the venue’s constraints: when you may enter, when music must die.",
      "Open Run of show. Put clock times, owner, and what the guest sees.",
      "Hide cues the shape does not need.",
      "Print two copies. One stays with you. One goes in the vendor packet.",
    ],
    actions: [{ label: "Open Run of show", href: "/run-of-show" }],
  },
  {
    id: "music-dj",
    title: "Hand music to the DJ",
    href: "/music",
    steps: [
      "Open Music. Build must-play and do-not-play. Cap must-play or they cannot do their job.",
      "Connect Spotify or Apple if you want to search real tracks.",
      "Print /music/print or send from Handoffs. Put your phone number on the sheet.",
      "Talk to the DJ once, a week out, with that same sheet in front of both of you.",
    ],
    actions: [
      { label: "Open Music", href: "/music" },
      { label: "Open Handoffs", href: "/handoffs" },
      { label: "Spotify", href: "https://open.spotify.com/", external: true },
    ],
  },
  {
    id: "playlists",
    title: "Make the playlists",
    href: "/music",
    steps: [
      "Make three lists in Spotify or Apple: ceremony, dinner, dancing.",
      "Copy the links into Music so they sit on the packet.",
      "Do not send the DJ twelve playlists. Send three plus do-not-play.",
    ],
    actions: [
      { label: "Open Music", href: "/music" },
      { label: "Spotify", href: "https://open.spotify.com/", external: true },
    ],
  },
  {
    id: "packet",
    title: "Build the day packet",
    href: "/packet",
    steps: [
      "Packet = run of show + floor + contacts + parking + music.",
      "Open Packet. Confirm each piece exists. Print or send.",
      "Give it 72 hours before the day, not the morning of.",
    ],
    actions: [
      { label: "Open Packet", href: "/packet" },
      { label: "Open Send", href: "/send" },
    ],
  },
  {
    id: "live-photos",
    title: "Collect guest photos",
    href: "/day-of",
    steps: [
      "Pick one gallery tool (Google Photos shared album, or a guest-photo app) and one link.",
      "Put that link on the guest site and on a small sign at the door.",
      "Do not ask people to download an app unless you must. A shared album is enough.",
    ],
    actions: [
      { label: "Google Photos", href: "https://photos.google.com/", external: true },
      { label: "Open Site", href: "/site" },
    ],
  },
  {
    id: "live-stream",
    title: "Stream for people who cannot come",
    href: "/site",
    steps: [
      "Use YouTube Live or Zoom. Do not build a studio.",
      "Put a phone on a stand with power. Point it at the aisle, not the DJ.",
      "Paste the view link on the guest site the morning of. Tell only the people who need it.",
    ],
    actions: [
      { label: "YouTube Live", href: "https://www.youtube.com/live_dashboard", external: true },
      { label: "Open Site", href: "/site" },
    ],
  },
  {
    id: "after",
    title: "Close the 90 days after",
    href: "/after",
    steps: [
      "After opens when the date has passed. If it is hidden, the date is still future.",
      "Week 1: returns and rentals. Week 2: thank-you list started. By 90 days: notes sent.",
      "Open After and work the clock in order. Do not skip to reviews.",
    ],
    actions: [{ label: "Open After", href: "/after" }],
  },
  {
    id: "thanks",
    title: "Write thank-yous",
    href: "/thanks",
    steps: [
      "Open Thanks. Every gift and presence should have a row and an address.",
      "Write presence first (“you flew”), then the object.",
      "Mail in two weeks if you can. Three months is the back stop.",
    ],
    actions: [{ label: "Open Thanks", href: "/thanks" }],
  },
  {
    id: "returns",
    title: "Return rentals",
    href: "/after#returns",
    steps: [
      "The morning after, put rental boxes by the door before leftovers.",
      "Open After → Returns. Check each vendor’s deadline.",
      "Photograph the packed boxes. Drive them back. Get the deposit line on Payments marked refunded when it hits.",
    ],
    actions: [{ label: "Open Returns", href: "/after#returns" }],
  },
  {
    id: "reviews",
    title: "Review vendors",
    href: "/after#reviews",
    steps: [
      "Write a private note on After first — what you would hire again.",
      "If you post publicly, do it on the site they asked for (Google, The Knot). Be specific.",
    ],
    actions: [{ label: "Open Reviews", href: "/after#reviews" }],
  },
  {
    id: "budget",
    title: "Run the budget",
    href: "/budget",
    steps: [
      "Agree the cap with whoever is paying. Put that number in first.",
      "Split it into envelopes: room, food, clothes, Studio, travel.",
      "Every time money leaves, log it the same day — vendor deposit or Amazon order.",
      "The one number at the top should match the bank, not a wish.",
    ],
    actions: [{ label: "Open Budget", href: "/budget" }],
  },
  {
    id: "payments",
    title: "Track deposits",
    href: "/payments",
    steps: [
      "When a contract is signed, add the deposit and the balance due date on Payments.",
      "Pay on that date. Mark it paid. Put the receipt in the Drive contracts folder.",
    ],
    actions: [{ label: "Open Payments", href: "/payments" }],
  },
  {
    id: "receipts",
    title: "Keep receipts",
    href: "/budget",
    steps: [
      "Photograph the receipt before it leaves the counter.",
      "Drop the photo on the Budget line it belongs to, or into the Drive receipts folder.",
      "OCR can wait. A dated photo is enough to argue a charge later.",
    ],
    actions: [{ label: "Open Budget", href: "/budget" }],
  },
  {
    id: "registry",
    title: "Set the registry",
    href: "/registry",
    steps: [
      "Pick one or two stores, not five. Zola or Amazon is enough for most people.",
      "Create the registry on that site. Copy the public link.",
      "Open Registry here and paste the link. Put the same link on the guest site — never on the invitation paper if you can help it.",
    ],
    actions: [
      { label: "Open Registry", href: "/registry" },
      { label: "Zola", href: "https://www.zola.com/", external: true },
      { label: "Amazon Registry", href: "https://www.amazon.com/wedding", external: true },
    ],
  },
  {
    id: "legal",
    title: "Read a contract",
    href: "/legal",
    steps: [
      "Do not sign in the parking lot. Bring it home.",
      "Open Legal. Walk the nine questions: who, what day, what happens if rain, cancel, overtime, insurance, who pays card fees.",
      "Write the answers in the margins. Then sign. File the PDF in Drive.",
    ],
    actions: [{ label: "Open Legal", href: "/legal" }],
  },
  {
    id: "contract-summarize",
    title: "Get a short read of a contract",
    href: "/legal",
    steps: [
      "Until Copilot can read PDFs, you do this by hand: open the PDF, answer the nine questions on Legal.",
      "If Silk is on later: upload the PDF, ask for rain, cancel, overtime, and money only. Ignore the rest of the chatter.",
    ],
    actions: [{ label: "Open Legal", href: "/legal" }],
  },
  {
    id: "auth",
    title: "Sign in",
    href: "/login",
    steps: [
      "Open Login. Use the magic link emailed to you.",
      "Google and Apple buttons need keys before they work. Until then, use the link or the demo desk.",
      "Use one email for the couple so you do not split the desk in two.",
    ],
    actions: [{ label: "Open Login", href: "/login" }],
  },
  {
    id: "email-scan",
    title: "Pull facts out of vendor email",
    href: "/integrations",
    steps: [
      "Until Gmail is connected: when a vendor emails a date or a total, copy it onto Vendors and Payments the same hour.",
      "File the email PDF in the Drive contracts folder.",
      "Do not forward the whole thread into this desk.",
    ],
    actions: [{ label: "Open Vendors", href: "/vendors" }],
  },
  {
    id: "sms",
    title: "Text guests",
    href: "/send",
    steps: [
      "Write the message on paper first. One idea. A link if they need to act.",
      "When SMS exists on Cloth/Silk, send from Send. Until then, use your phone once to the family thread and the guest site for everyone else.",
      "Do not text the whole list the morning of unless the venue moved.",
    ],
    actions: [{ label: "Open Send", href: "/send" }],
  },
  {
    id: "social",
    title: "Update Instagram / Facebook / TikTok",
    href: "/",
    steps: [
      "Write the post in Notes. One picture from the moodboard or the day.",
      "Post natively in Instagram / Facebook / TikTok, or Buffer if you already use it.",
      "Put the guest-site link in the bio, not in every caption.",
    ],
    actions: [
      { label: "Instagram", href: "https://www.instagram.com/", external: true },
      { label: "Buffer", href: "https://buffer.com/", external: true },
    ],
  },
  {
    id: "integrations-hub",
    title: "Connect other tools",
    href: "/integrations",
    steps: [
      "Open Integrations. Only connect what you already pay for.",
      "Spotify / Apple for music. Canva for paper. Drive folder by URL for files.",
      "If a tool is not listed, paste its link in the room that needs it. Do not wait for an API.",
    ],
    actions: [{ label: "Open Integrations", href: "/integrations" }],
  },
  {
    id: "copilot",
    title: "Ask Copilot",
    href: "/dashboard",
    steps: [
      "Tap Copilot on the desk. Ask one job: “what is due this week” or “add a task to call the baker.”",
      "Check This week after it answers. If the task is not there, add it yourself on Checklist.",
      "Silk is the plan that includes this. Paper does not.",
    ],
    actions: [{ label: "Open Home", href: "/dashboard" }],
  },
  {
    id: "vendor-portal",
    title: "Give a vendor a door",
    href: "/send",
    steps: [
      "Until a portal exists: send the packet link. That is the door.",
      "Tell them the link works on a phone. They do not need an account.",
    ],
    actions: [{ label: "Open Send", href: "/send" }],
  },
  {
    id: "event-packs",
    title: "Use another event type",
    href: "/planning",
    steps: [
      "Wedding is the first pack. A mitzvah or gala later is the same desk with different tasks.",
      "For now: start a wedding desk and ignore aisle work if this is not a wedding — set shape to us or small.",
    ],
    actions: [{ label: "Open Plan", href: "/planning" }],
  },
  {
    id: "live-app",
    title: "Use the desk on a phone",
    href: "/mobile",
    steps: [
      "On the phone browser, open the desk and use Add to Home Screen.",
      "Day-of and This week are the two rooms that must work standing up.",
      "Print still happens on a laptop.",
    ],
    actions: [{ label: "Open Mobile", href: "/mobile" }],
  },
  {
    id: "money-plan",
    title: "Choose Paper, Cloth, or Silk",
    href: "/plans",
    steps: [
      "Open Plans. Paper is free and capped. Cloth is $99/mo and unlocks Studio and print. Silk is $199/mo and unlocks Copilot, SMS, and the pipes.",
      "Count guests and whether you are making paper and flowers. If you are only keeping a list, stay on Paper.",
      "Nothing is billed yet. This is the map.",
    ],
    actions: [{ label: "Open Plans", href: "/plans" }],
  },
  {
    id: "bundled-plan",
    title: "Pay once for the pipes",
    href: "/plans",
    steps: [
      "Silk is meant to cover SMS credits, print credits, and Copilot tokens so you are not stacking five subscriptions.",
      "Add up what you already pay Zola / Canva / a text tool. If Silk is more than that and you will not use Studio, do not buy it.",
    ],
    actions: [{ label: "Open Plans", href: "/plans" }],
  },
  {
    id: "marketing",
    title: "Talk about the desk in public",
    href: "/",
    steps: [
      "Photograph real Studio work — a table, a card — not a stock aisle.",
      "Post on Instagram or Pinterest with the line: Plan it. Make it. Celebrate it.",
      "Atlanta first. Do not run vendor ads.",
    ],
    actions: [
      { label: "Open the mark", href: "/" },
      { label: "Instagram", href: "https://www.instagram.com/", external: true },
    ],
  },
];

export function getHowTo(id: string): HowGuide | undefined {
  return HOW_TO.find((g) => g.id === id);
}

export function stepsFor(id: string, title: string, href: string, doThis: string): HowGuide {
  const found = getHowTo(id);
  if (found) return found;
  return {
    id,
    title,
    href,
    steps: [
      `Open ${title} and read what is already there.`,
      doThis,
      "Do the real-world piece next — call, buy, print, or send — then come back and mark it done.",
    ],
    actions: [
      { label: `Open ${title}`, href },
      { label: "Open Home", href: "/dashboard" },
    ],
  };
}
