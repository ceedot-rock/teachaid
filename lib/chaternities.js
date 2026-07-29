/**
 * TEACHAiD Chaternities — fraternity / study / common chat rooms.
 * Create: $20 one-time. Join study/common: $1/mo (90% creator, 10% TEACHAiD Fund).
 * Admittance: creator and/or admins appointed by creator.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TeachaidChaternities = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var CREATE_FEE_CENTS = 2000;
  var JOIN_FEE_CENTS = 100;
  var FUND_SHARE = 0.1; // 10% TEACHAiD Fund
  var CREATOR_SHARE = 0.9;
  var TYPES = ["fraternity", "study", "common"];

  function uid(prefix) {
    return (
      (prefix || "r") +
      "_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    );
  }

  function emptyStore() {
    return { rooms: {}, memberships: {}, createCredits: 0, joinUntil: 0 };
  }

  function ensureStore(raw) {
    var s = raw && typeof raw === "object" ? raw : emptyStore();
    if (!s.rooms) s.rooms = {};
    if (!s.memberships) s.memberships = {};
    if (typeof s.createCredits !== "number") s.createCredits = 0;
    if (typeof s.joinUntil !== "number") s.joinUntil = 0;
    return s;
  }

  function canCreateRoom(store) {
    store = ensureStore(store);
    return store.createCredits > 0;
  }

  function hasJoinPass(store, now) {
    store = ensureStore(store);
    now = now || Date.now();
    return store.joinUntil > now;
  }

  function grantCreateCredit(store, n) {
    store = ensureStore(store);
    store.createCredits = (store.createCredits || 0) + (n || 1);
    return store;
  }

  function grantJoinMonth(store, now) {
    store = ensureStore(store);
    now = now || Date.now();
    var base = Math.max(store.joinUntil || 0, now);
    store.joinUntil = base + 32 * 24 * 60 * 60 * 1000;
    return store;
  }

  /**
   * @param {object} opts
   * @param {string} opts.name
   * @param {string} opts.type fraternity|study|common
   * @param {string} opts.creatorId student id
   * @param {string} opts.creatorName
   * @param {string} [opts.topic]
   */
  function createRoom(store, opts) {
    store = ensureStore(store);
    opts = opts || {};
    if (!canCreateRoom(store)) {
      return { ok: false, error: "Pay $20 to create a Chaternity room first." };
    }
    var type = TYPES.indexOf(opts.type) >= 0 ? opts.type : "fraternity";
    var name = String(opts.name || "").trim().slice(0, 60);
    if (name.length < 2) {
      return { ok: false, error: "Room name needs at least 2 characters." };
    }
    var creatorId = String(opts.creatorId || "").slice(0, 40);
    if (!creatorId) {
      return { ok: false, error: "Missing creator Student ID." };
    }
    store.createCredits -= 1;
    var id = uid("chat");
    var room = {
      id: id,
      name: name,
      type: type,
      topic: String(opts.topic || "").slice(0, 160),
      creatorId: creatorId,
      creatorName: String(opts.creatorName || "Creator").slice(0, 40),
      adminIds: [creatorId],
      members: [creatorId],
      pending: [], // { studentId, name, at, note }
      banned: [],
      admitMode: "creator_or_admin", // creator_only | creator_or_admin
      messages: [],
      createdAt: new Date().toISOString(),
      joinFeeCents: type === "fraternity" ? JOIN_FEE_CENTS : JOIN_FEE_CENTS,
      split: { creator: CREATOR_SHARE, fund: FUND_SHARE },
    };
    store.rooms[id] = room;
    store.memberships[id] = {
      role: "creator",
      joinedAt: room.createdAt,
      status: "active",
    };
    return { ok: true, store: store, room: room };
  }

  function getRoom(store, roomId) {
    store = ensureStore(store);
    return store.rooms[roomId] || null;
  }

  function isAdmin(room, studentId) {
    if (!room || !studentId) return false;
    if (room.creatorId === studentId) return true;
    return (room.adminIds || []).indexOf(studentId) >= 0;
  }

  function isMember(room, studentId) {
    return !!(room && (room.members || []).indexOf(studentId) >= 0);
  }

  function requestJoin(store, roomId, studentId, name, note) {
    store = ensureStore(store);
    var room = store.rooms[roomId];
    if (!room) return { ok: false, error: "Room not found." };
    if (isMember(room, studentId)) {
      return { ok: false, error: "Already a member." };
    }
    if ((room.banned || []).indexOf(studentId) >= 0) {
      return { ok: false, error: "You are banned from this room." };
    }
    // study/common require active $1/mo join pass
    if (room.type === "study" || room.type === "common") {
      if (!hasJoinPass(store)) {
        return {
          ok: false,
          error: "Pay $1/month to join study or student common rooms.",
        };
      }
    }
    // fraternity also uses join pass for paid commons-style access when set
    if (room.type === "fraternity" && !hasJoinPass(store) && !isAdmin(room, studentId)) {
      // fraternity: still need creator approval; join fee optional for frat
      // User said study and student common cost $1/mo - fraternity admittance by creator
      // Fraternity: admittance gated, no $1 required for request (creator gates)
    }
    var pending = room.pending || [];
    if (pending.some(function (p) { return p.studentId === studentId; })) {
      return { ok: false, error: "Join request already pending." };
    }
    pending.push({
      studentId: studentId,
      name: String(name || "Student").slice(0, 40),
      note: String(note || "").slice(0, 200),
      at: new Date().toISOString(),
    });
    room.pending = pending;
    store.rooms[roomId] = room;
    return { ok: true, store: store, room: room, status: "pending" };
  }

  function decideJoin(store, roomId, actorId, targetId, approve) {
    store = ensureStore(store);
    var room = store.rooms[roomId];
    if (!room) return { ok: false, error: "Room not found." };
    if (!isAdmin(room, actorId)) {
      return { ok: false, error: "Only the creator or an admin can admit members." };
    }
    var pending = room.pending || [];
    var found = null;
    room.pending = pending.filter(function (p) {
      if (p.studentId === targetId) {
        found = p;
        return false;
      }
      return true;
    });
    if (!found) return { ok: false, error: "No pending request for that student." };
    if (approve) {
      if ((room.members || []).indexOf(targetId) < 0) {
        room.members = (room.members || []).concat([targetId]);
      }
      store.memberships[roomId + ":" + targetId] = {
        role: "member",
        joinedAt: new Date().toISOString(),
        status: "active",
        name: found.name,
      };
    }
    store.rooms[roomId] = room;
    return { ok: true, store: store, room: room, approved: !!approve };
  }

  function setAdmins(store, roomId, actorId, adminIds) {
    store = ensureStore(store);
    var room = store.rooms[roomId];
    if (!room) return { ok: false, error: "Room not found." };
    if (room.creatorId !== actorId) {
      return { ok: false, error: "Only the creator can appoint admins." };
    }
    var list = Array.isArray(adminIds) ? adminIds : [];
    var cleaned = list
      .map(function (x) { return String(x).slice(0, 40); })
      .filter(Boolean);
    if (cleaned.indexOf(room.creatorId) < 0) cleaned.unshift(room.creatorId);
    room.adminIds = cleaned.slice(0, 12);
    store.rooms[roomId] = room;
    return { ok: true, store: store, room: room };
  }

  function postMessage(store, roomId, studentId, name, text) {
    store = ensureStore(store);
    var room = store.rooms[roomId];
    if (!room) return { ok: false, error: "Room not found." };
    if (!isMember(room, studentId)) {
      return { ok: false, error: "Members only." };
    }
    text = String(text || "").trim().slice(0, 1000);
    if (!text) return { ok: false, error: "Empty message." };
    room.messages = (room.messages || []).concat([
      {
        id: uid("m"),
        studentId: studentId,
        name: String(name || "Student").slice(0, 40),
        text: text,
        at: new Date().toISOString(),
      },
    ]);
    if (room.messages.length > 200) room.messages = room.messages.slice(-200);
    store.rooms[roomId] = room;
    return { ok: true, store: store, room: room };
  }

  function splitDisplay() {
    return {
      joinMonthlyCents: JOIN_FEE_CENTS,
      createCents: CREATE_FEE_CENTS,
      creatorShare: CREATOR_SHARE,
      fundShare: FUND_SHARE,
      creatorPerJoinCents: Math.round(JOIN_FEE_CENTS * CREATOR_SHARE),
      fundPerJoinCents: Math.round(JOIN_FEE_CENTS * FUND_SHARE),
      note:
        "Of each $1/mo join, 90¢ routes to the room creator and 10¢ to the TEACHAiD Fund.",
    };
  }

  function listRooms(store) {
    store = ensureStore(store);
    return Object.keys(store.rooms)
      .map(function (id) { return store.rooms[id]; })
      .sort(function (a, b) {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
  }

  function exportRoomCode(room) {
    if (!room) return "";
    try {
      var payload = {
        v: 1,
        id: room.id,
        name: room.name,
        type: room.type,
        creatorId: room.creatorId,
        creatorName: room.creatorName,
      };
      var json = JSON.stringify(payload);
      if (typeof btoa === "function") {
        return "TEACHAiD_CHAT:" + btoa(unescape(encodeURIComponent(json)));
      }
      return "TEACHAiD_CHAT:" + Buffer.from(json, "utf8").toString("base64");
    } catch (e) {
      return "";
    }
  }

  function importRoomStub(store, code) {
    store = ensureStore(store);
    var s = String(code || "").trim();
    var m = s.match(/TEACHAiD_CHAT:([A-Za-z0-9+/=]+)/);
    var b64 = m ? m[1] : s;
    try {
      var json =
        typeof atob === "function"
          ? decodeURIComponent(escape(atob(b64)))
          : Buffer.from(b64, "base64").toString("utf8");
      var data = JSON.parse(json);
      if (!data.id || !data.name) throw new Error("bad");
      if (!store.rooms[data.id]) {
        store.rooms[data.id] = {
          id: data.id,
          name: data.name,
          type: data.type || "study",
          topic: "",
          creatorId: data.creatorId || "",
          creatorName: data.creatorName || "Creator",
          adminIds: data.creatorId ? [data.creatorId] : [],
          members: data.creatorId ? [data.creatorId] : [],
          pending: [],
          banned: [],
          admitMode: "creator_or_admin",
          messages: [],
          createdAt: new Date().toISOString(),
          joinFeeCents: JOIN_FEE_CENTS,
          split: { creator: CREATOR_SHARE, fund: FUND_SHARE },
          imported: true,
        };
      }
      return { ok: true, store: store, room: store.rooms[data.id] };
    } catch (e) {
      return { ok: false, error: "Invalid room code." };
    }
  }

  return {
    CREATE_FEE_CENTS: CREATE_FEE_CENTS,
    JOIN_FEE_CENTS: JOIN_FEE_CENTS,
    FUND_SHARE: FUND_SHARE,
    CREATOR_SHARE: CREATOR_SHARE,
    TYPES: TYPES,
    emptyStore: emptyStore,
    ensureStore: ensureStore,
    canCreateRoom: canCreateRoom,
    hasJoinPass: hasJoinPass,
    grantCreateCredit: grantCreateCredit,
    grantJoinMonth: grantJoinMonth,
    createRoom: createRoom,
    getRoom: getRoom,
    isAdmin: isAdmin,
    isMember: isMember,
    requestJoin: requestJoin,
    decideJoin: decideJoin,
    setAdmins: setAdmins,
    postMessage: postMessage,
    splitDisplay: splitDisplay,
    listRooms: listRooms,
    exportRoomCode: exportRoomCode,
    importRoomStub: importRoomStub,
  };
});
