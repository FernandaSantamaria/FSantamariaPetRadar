import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: parseInt(this.config.get('MAIL_PORT', '465')),
      secure: true,
      family: 4,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASSWORD'),
      },
    } as any);
  }

  private buildMapboxUrl(lat: number, lng: number): string {
    const token = this.config.get('MAPBOX_TOKEN', '');
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},15/600x250?access_token=${token}`;
  }

  async sendFoundPetNotification(foundPet: any, lostPet: any): Promise<void> {
    const distanceText = lostPet.distance
      ? `${Math.round(lostPet.distance)} metros`
      : 'menos de 500 metros';

    const mapLostUrl  = this.buildMapboxUrl(lostPet.latitude,  lostPet.longitude);
    const mapFoundUrl = this.buildMapboxUrl(foundPet.latitude, foundPet.longitude);

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Nunito','Segoe UI',sans-serif;background:#F3EEFF;padding:30px 15px}
.wrapper{max-width:580px;margin:0 auto}
.header{background:linear-gradient(135deg,#C084FC 0%,#E879F9 50%,#F472B6 100%);border-radius:28px 28px 0 0;padding:36px 30px 28px;text-align:center;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:rgba(255,255,255,0.12);border-radius:50%}
.header::after{content:'';position:absolute;bottom:-30px;left:-20px;width:120px;height:120px;background:rgba(255,255,255,0.08);border-radius:50%}
.header-paw{font-size:42px;display:block;margin-bottom:8px}
.header h1{color:white;font-size:28px;font-weight:900;letter-spacing:-0.5px}
.header p{color:rgba(255,255,255,0.88);font-size:14px;margin-top:6px;font-weight:600}
.body{background:#FFFFFF;padding:28px 28px 0}
.alert-pill{background:linear-gradient(135deg,#FAF0FF,#FFF0FA);border:1.5px solid #E9D5FF;border-radius:16px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px}
.alert-pill .icon{font-size:24px;flex-shrink:0;margin-top:2px}
.alert-pill p{color:#7C3AED;font-size:14px;font-weight:700;line-height:1.5}
.alert-pill span{color:#C026D3}
.distance-banner{background:linear-gradient(90deg,#7C3AED,#C026D3);border-radius:14px;padding:12px 20px;text-align:center;color:white;font-size:13px;font-weight:700;margin-bottom:20px}
.distance-banner strong{font-size:18px;display:block}
.section-label{font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.section-label.found{color:#A855F7}
.section-label.lost{color:#EC4899}
.section-label.contact{color:#6366F1}
.section-label.map-lost{color:#EC4899}
.section-label.map-found{color:#A855F7}
.section-label::after{content:'';flex:1;height:1.5px;background:currentColor;opacity:0.2;border-radius:2px}
.pet-card{border-radius:20px;padding:20px;margin-bottom:20px}
.found-card{background:linear-gradient(135deg,#FAF5FF,#FDF2FF);border:1.5px solid #E9D5FF}
.lost-card{background:linear-gradient(135deg,#FFF0F6,#FFF5F0);border:1.5px solid #FBCFE8}
.pet-card-header{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.pet-avatar{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
.found-card .pet-avatar{background:linear-gradient(135deg,#C084FC,#E879F9)}
.lost-card .pet-avatar{background:linear-gradient(135deg,#F472B6,#FB923C)}
.pet-name{font-size:20px;font-weight:900;color:#1a1a2e;letter-spacing:-0.3px}
.pet-subtitle{font-size:13px;color:#888;font-weight:600;margin-top:2px}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.badge{padding:5px 14px;border-radius:50px;font-size:12px;font-weight:700}
.badge-purple{background:#EDE9FE;color:#7C3AED}
.badge-pink{background:#FCE7F3;color:#BE185D}
.badge-green{background:#DCFCE7;color:#15803D}
.badge-blue{background:#DBEAFE;color:#1D4ED8}
.badge-orange{background:#FEF3C7;color:#B45309}
.pet-description{font-size:13px;color:#555;line-height:1.6;background:rgba(255,255,255,0.6);border-radius:12px;padding:12px 14px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.info-item{background:rgba(255,255,255,0.7);border-radius:12px;padding:10px 14px}
.info-item .label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#aaa;margin-bottom:3px}
.info-item .value{font-size:13px;font-weight:700;color:#333}
.info-item.full{grid-column:1 / -1}
.contact-card{background:linear-gradient(135deg,#EEF2FF,#F0F9FF);border:1.5px solid #C7D2FE;border-radius:20px;padding:20px;margin-bottom:20px}
.contact-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(99,102,241,0.1)}
.contact-row:last-child{border-bottom:none;padding-bottom:0}
.contact-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.contact-info .clabel{font-size:10px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.6px}
.contact-info .cvalue{font-size:14px;color:#3730A3;font-weight:700}
.contact-info a{color:#4F46E5;text-decoration:none}
.map-box{border-radius:20px;overflow:hidden;margin-bottom:20px;border:2px solid #E9D5FF}
.map-box.pink-border{border-color:#FBCFE8}
.map-header{padding:10px 16px;font-size:12px;font-weight:800;display:flex;align-items:center;gap:8px}
.map-header.purple-bg{background:linear-gradient(135deg,#EDE9FE,#FAF5FF);color:#7C3AED}
.map-header.pink-bg{background:linear-gradient(135deg,#FCE7F3,#FFF0F6);color:#BE185D}
.map-img{width:100%;display:block}
.gap{height:24px}
.footer{background:linear-gradient(135deg,#C084FC,#F472B6);border-radius:0 0 28px 28px;padding:24px 28px;text-align:center}
.footer p{color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;line-height:1.8}
.footer strong{color:white}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <span class="header-paw">🐾</span>
    <h1>PetRadar</h1>
    <p>¡Posible coincidencia encontrada cerca de ti!</p>
  </div>
  <div class="body">
    <div style="height:24px"></div>
    <div class="alert-pill">
      <span class="icon">🔔</span>
      <p>Se registró una mascota encontrada a <span>~${distanceText}</span> de donde se perdió <span>${lostPet.name}</span>. ¡Podría ser ella!</p>
    </div>
    <div class="distance-banner">
      <strong>📍 ${distanceText} de distancia</strong>
      entre ambos puntos reportados
    </div>

    <div class="section-label found">🟣 Mascota encontrada</div>
    <div class="pet-card found-card">
      <div class="pet-card-header">
        <div class="pet-avatar">🐶</div>
        <div>
          <div class="pet-name">${foundPet.species}</div>
          <div class="pet-subtitle">${foundPet.breed || 'Raza no identificada'}</div>
        </div>
      </div>
      <div class="badges">
        <span class="badge badge-purple">🎨 ${foundPet.color}</span>
        <span class="badge badge-blue">📏 ${foundPet.size}</span>
        <span class="badge badge-green">📅 ${new Date(foundPet.found_date).toLocaleDateString('es-MX')}</span>
      </div>
      <div class="pet-description">${foundPet.description}</div>
      <div class="info-grid">
        <div class="info-item full">
          <div class="label">📍 Encontrada en</div>
          <div class="value">${foundPet.address}</div>
        </div>
        ${foundPet.photo_url ? `<div class="info-item full"><div class="label">📷 Foto</div><div class="value"><a href="${foundPet.photo_url}" style="color:#7C3AED;">Ver foto →</a></div></div>` : ''}
      </div>
    </div>

    <div class="section-label contact">📞 Contacto — quien la encontró</div>
    <div class="contact-card">
      <div class="contact-row">
        <div class="contact-icon">👤</div>
        <div class="contact-info">
          <div class="clabel">Nombre</div>
          <div class="cvalue">${foundPet.finder_name}</div>
        </div>
      </div>
      <div class="contact-row">
        <div class="contact-icon">✉️</div>
        <div class="contact-info">
          <div class="clabel">Correo</div>
          <div class="cvalue"><a href="mailto:${foundPet.finder_email}">${foundPet.finder_email}</a></div>
        </div>
      </div>
      <div class="contact-row">
        <div class="contact-icon">📱</div>
        <div class="contact-info">
          <div class="clabel">Teléfono</div>
          <div class="cvalue"><a href="tel:${foundPet.finder_phone}">${foundPet.finder_phone}</a></div>
        </div>
      </div>
    </div>

    <div class="section-label lost">🔴 Tu mascota perdida</div>
    <div class="pet-card lost-card">
      <div class="pet-card-header">
        <div class="pet-avatar">🐾</div>
        <div>
          <div class="pet-name">${lostPet.name}</div>
          <div class="pet-subtitle">${lostPet.species} · ${lostPet.breed}</div>
        </div>
      </div>
      <div class="badges">
        <span class="badge badge-pink">🎨 ${lostPet.color}</span>
        <span class="badge badge-orange">📏 ${lostPet.size}</span>
      </div>
      <div class="info-grid">
        <div class="info-item full">
          <div class="label">📍 Se perdió en</div>
          <div class="value">${lostPet.address}</div>
        </div>
      </div>
    </div>

    <div class="section-label map-lost">🔴 Mapa — Donde se perdió</div>
    <div class="map-box pink-border">
      <div class="map-header pink-bg">📍 ${lostPet.address}</div>
      <img class="map-img" src="${mapLostUrl}" alt="Donde se perdió ${lostPet.name}" />
    </div>

    <div class="section-label map-found">🟣 Mapa — Donde fue encontrada</div>
    <div class="map-box">
      <div class="map-header purple-bg">📍 ${foundPet.address}</div>
      <img class="map-img" src="${mapFoundUrl}" alt="Donde fue encontrada" />
    </div>

    <div class="gap"></div>
  </div>
  <div class="footer">
    <p>Este correo fue generado automáticamente por <strong>PetRadar</strong> 🐾</p>
    <p>Si ya encontraste a tu mascota, por favor actualiza el reporte.</p>
  </div>
</div>
</body>
</html>`;

    const mailTo   = this.config.get('MAIL_TO',   'notificaciones@petradar.com');
    const mailFrom = this.config.get('MAIL_FROM',  'PetRadar <noreply@petradar.com>');

    // Correo al correo genérico de PetRadar
    await this.transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: `🐾 PetRadar: Posible coincidencia para ${lostPet.name} — encontrada a ${distanceText}`,
      html,
    });

    // Correo al dueño de la mascota perdida
    await this.transporter.sendMail({
      from: mailFrom,
      to: lostPet.owner_email,
      subject: `🐾 PetRadar: Posible coincidencia para ${lostPet.name} — encontrada a ${distanceText}`,
      html,
    });
  }
}