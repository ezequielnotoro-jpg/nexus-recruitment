const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "NEXUS-ADMIN-2026";
const LOBBY_URL = process.env.LOBBY_URL || "";
const WHATSAPP_URL = process.env.WHATSAPP_URL || "";

const DATA_FILE = path.join(__dirname, "applications.json");
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));

function readApps() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}
function writeApps(apps) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2));
}
function id() {
  return "NXS-" + Math.floor(1000000 + Math.random()*9000000);
}

async function resolveRobloxUsername(username) {
  const response = await fetch("https://users.roblox.com/v1/usernames/users", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({usernames:[username], excludeBannedUsers:false})
  });
  if (!response.ok) throw new Error("Roblox API error");
  const data = await response.json();
  return data.data && data.data[0] ? data.data[0] : null;
}

app.get("/api/health",(req,res)=>res.json({ok:true, service:"NEXUS Web Bot"}));

app.post("/api/applications", async (req,res)=>{
  const {
    robloxUsername, age, evadeLevel, weeklyHours, otherClan,
    rulesAccepted, reason, truthful
  } = req.body;

  if (!robloxUsername || !age || !evadeLevel || !weeklyHours || !otherClan ||
      !rulesAccepted || !reason || !truthful) {
    return res.status(400).json({ok:false,message:"Completa todos los campos obligatorios."});
  }

  const nAge = Number(age), nLevel = Number(evadeLevel), nHours = Number(weeklyHours);
  const failures = [];

  if (nAge < 10 || nAge > 20) failures.push("La edad debe estar entre 10 y 20 años.");
  if (nLevel < 20) failures.push("El nivel de Evade debe ser mínimo 20.");
  if (nHours < 7) failures.push("Debes jugar mínimo 7 horas por semana.");
  if (String(otherClan).toLowerCase() !== "no") failures.push("No puedes pertenecer actualmente a otro clan o team.");
  if (String(rulesAccepted).toLowerCase() !== "si") failures.push("Debes aceptar las reglas de NEXUS.");

  let robloxUser = null;
  try {
    robloxUser = await resolveRobloxUsername(robloxUsername.trim());
    if (!robloxUser) failures.push("No se pudo encontrar ese usuario de Roblox.");
  } catch {
    // If Roblox is temporarily unavailable, don't falsely reject; send to manual review.
  }

  const application = {
    id:id(),
    createdAt:new Date().toISOString(),
    robloxUsername:robloxUser?.name || robloxUsername.trim(),
    robloxDisplayName:robloxUser?.displayName || "",
    robloxUserId:robloxUser?.id || null,
    age:nAge,
    evadeLevel:nLevel,
    weeklyHours:nHours,
    otherClan:String(otherClan),
    rulesAccepted:String(rulesAccepted),
    reason:String(reason).trim(),
    truthful:String(truthful),
    status: failures.length ? "rejected" : "review",
    failures,
    adminNote:"",
    lobbyUrl:LOBBY_URL,
    whatsappUrl:WHATSAPP_URL
  };

  const apps=readApps();
  apps.unshift(application);
  writeApps(apps);

  if (application.status === "rejected") {
    return res.json({
      ok:true,status:"rejected",applicationId:application.id,
      message:"Tu solicitud fue rechazada automáticamente.",
      failures
    });
  }

  return res.json({
    ok:true,status:"review",applicationId:application.id,
    message:"Solicitud enviada. Un administrador de NEXUS revisará tu postulación."
  });
});

function auth(req,res,next){
  const key=req.headers["x-admin-key"] || req.query.key;
  if(key !== ADMIN_KEY) return res.status(401).json({ok:false,message:"No autorizado."});
  next();
}

app.get("/api/applications",auth,(req,res)=>{
  res.json({ok:true,applications:readApps()});
});

app.post("/api/applications/:id/status",auth,(req,res)=>{
  const apps=readApps();
  const index=apps.findIndex(a=>a.id===req.params.id);
  if(index<0) return res.status(404).json({ok:false,message:"Solicitud no encontrada."});

  const {status,adminNote,lobbyUrl,whatsappUrl}=req.body;
  if(!["approved","rejected","review"].includes(status))
    return res.status(400).json({ok:false,message:"Estado inválido."});

  apps[index].status=status;
  if(adminNote !== undefined) apps[index].adminNote=String(adminNote);
  if(lobbyUrl !== undefined) apps[index].lobbyUrl=String(lobbyUrl);
  if(whatsappUrl !== undefined) apps[index].whatsappUrl=String(whatsappUrl);
  apps[index].updatedAt=new Date().toISOString();
  writeApps(apps);

  res.json({ok:true,application:apps[index]});
});

app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));

app.listen(PORT,()=>console.log(`NEXUS Web Bot running on port ${PORT}`));
