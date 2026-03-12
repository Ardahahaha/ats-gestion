import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "fr" | "tr";

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Layout
    "layout.dashboard": "Tableau de bord collaboratif",
    "layout.darkMode": "Mode nuit",
    "layout.lightMode": "Mode jour",
    "layout.logout": "Se déconnecter",
    "layout.myAccount": "Mon compte",
    "layout.synced": "Synchronisé en temps réel",
    "layout.back": "Retour au menu",

    // Login
    "login.title": "Se connecter",
    "login.subtitle": "Entrez vos identifiants",
    "login.email": "Adresse e-mail",
    "login.password": "Mot de passe",
    "login.submit": "Se connecter",
    "login.loading": "Connexion…",
    "login.signup": "Créer un compte",
    "login.signupTitle": "Créer un compte",
    "login.signupSubtitle": "Choisissez votre type de compte",
    "login.pseudo": "Votre pseudo",
    "login.yourEmail": "Votre adresse e-mail",
    "login.yourPassword": "Votre mot de passe (min. 6 caractères)",
    "login.rolePassword": "Mot de passe",
    "login.createAccount": "Créer le compte",
    "login.creating": "Création…",
    "login.admin": "Admin",
    "login.technician": "Technicien",
    "login.connection": "Connexion",
    "login.successLogin": "Connecté avec succès",
    "login.errorLogin": "Identifiants incorrects",
    "login.successSignup": "Compte créé et connecté avec succès !",
    "login.errorSignup": "Erreur lors de la création du compte",
    "login.errorMinPassword": "Le mot de passe doit contenir au moins 6 caractères",

    // Menu
    "menu.title": "Menu Principal",

    // Compte
    "compte.title": "Mon Compte",
    "compte.subtitle": "Gérez vos informations personnelles",
    "compte.noPseudo": "Sans pseudo",
    "compte.administrator": "Administrateur",
    "compte.technician": "Technicien",
    "compte.changePseudo": "Modifier le pseudo",
    "compte.newPseudo": "Nouveau pseudo",
    "compte.save": "Enregistrer",
    "compte.pseudoTaken": "Ce pseudo est déjà pris",
    "compte.pseudoUpdated": "Pseudo mis à jour !",
    "compte.updateError": "Erreur lors de la mise à jour",
    "compte.dangerZone": "Zone dangereuse",
    "compte.deleteWarning": "La suppression de votre compte est irréversible. Toutes vos données seront perdues.",
    "compte.deleteAccount": "Supprimer mon compte",
    "compte.deleteTitle": "Supprimer le compte",
    "compte.deleteDesc": "Cette action est irréversible. Votre compte et toutes vos données seront définitivement supprimés.",
    "compte.deleteConfirmLabel": "Tapez SUPPRIMER pour confirmer :",
    "compte.deleteConfirmWord": "SUPPRIMER",
    "compte.cancel": "Annuler",
    "compte.confirmDelete": "Confirmer la suppression",
    "compte.deleting": "Suppression…",
    "compte.deleted": "Compte supprimé",
    "compte.sessionExpired": "Session expirée",
    "compte.deleteError": "Erreur lors de la suppression",
    "compte.language": "Langue",
    "compte.languageDesc": "Choisissez la langue de l'interface",

    // Gestion Services
    "services.title": "Gestion des Services",
    "services.addService": "Ajouter une fiche",
    "services.noServices": "Aucune fiche de service",
    "services.noServicesDesc": "Ajoutez une fiche pour commencer",
    "services.model": "Modèle",
    "services.plate": "Immat",
    "services.name": "Technicien…",
    "services.entry": "Entrée",
    "services.exit": "Sortie",
    "services.mileage": "km",
    "services.mechanics": "Mécanique",
    "services.bodywork": "Carrosserie",
    "services.readOnly": "Mode lecture seule — accès technicien",
    "services.inProgress": "En cours",
    "services.toCheck": "À vérifier",
    "services.done": "Fait",
    "services.problem": "Problème !",
    "services.selectSections": "Sections à inclure",
    "services.create": "Créer",

    // Gestion Véhicules
    "vehicles.title": "Gestion des Véhicules",
    "vehicles.vehicle": "véhicule",
    "vehicles.vehicles": "véhicules",
    "vehicles.concession": "concession",
    "vehicles.concessions": "concessions",
    "vehicles.newConcession": "Nouvelle concession",
    "vehicles.addConcession": "Ajouter une concession",
    "vehicles.concessionName": "Nom de la concession…",
    "vehicles.add": "Ajouter",
    "vehicles.noConcessions": "Aucune concession pour le moment",
    "vehicles.noConcessionsSub": "Cliquez sur « Nouvelle concession » pour commencer",
    "vehicles.noVehicles": "Aucun véhicule",
    "vehicles.deleteConcessionConfirm": "Supprimer la concession « {name} » et tous ses véhicules ?",
    "vehicles.brand": "Marque",
    "vehicles.model": "Modèle",
    "vehicles.plate": "Immat",
    "vehicles.state": "État",
    "vehicles.tech": "Tech",
    "vehicles.readOnly": "Mode lecture seule — accès technicien",
  },
  tr: {
    // Layout
    "layout.dashboard": "İşbirlikçi kontrol paneli",
    "layout.darkMode": "Gece modu",
    "layout.lightMode": "Gündüz modu",
    "layout.logout": "Çıkış yap",
    "layout.myAccount": "Hesabım",
    "layout.synced": "Gerçek zamanlı senkronize",
    "layout.back": "Menüye dön",

    // Login
    "login.title": "Giriş Yap",
    "login.subtitle": "Kimlik bilgilerinizi girin",
    "login.email": "E-posta adresi",
    "login.password": "Şifre",
    "login.submit": "Giriş yap",
    "login.loading": "Giriş yapılıyor…",
    "login.signup": "Hesap oluştur",
    "login.signupTitle": "Hesap oluştur",
    "login.signupSubtitle": "Hesap türünüzü seçin",
    "login.pseudo": "Kullanıcı adınız",
    "login.yourEmail": "E-posta adresiniz",
    "login.yourPassword": "Şifreniz (min. 6 karakter)",
    "login.rolePassword": "Şifre",
    "login.createAccount": "Hesap oluştur",
    "login.creating": "Oluşturuluyor…",
    "login.admin": "Yönetici",
    "login.technician": "Teknisyen",
    "login.connection": "Giriş",
    "login.successLogin": "Başarıyla giriş yapıldı",
    "login.errorLogin": "Geçersiz kimlik bilgileri",
    "login.successSignup": "Hesap oluşturuldu ve giriş yapıldı!",
    "login.errorSignup": "Hesap oluşturulurken hata",
    "login.errorMinPassword": "Şifre en az 6 karakter olmalıdır",

    // Menu
    "menu.title": "Ana Menü",

    // Compte
    "compte.title": "Hesabım",
    "compte.subtitle": "Kişisel bilgilerinizi yönetin",
    "compte.noPseudo": "Kullanıcı adı yok",
    "compte.administrator": "Yönetici",
    "compte.technician": "Teknisyen",
    "compte.changePseudo": "Kullanıcı adını değiştir",
    "compte.newPseudo": "Yeni kullanıcı adı",
    "compte.save": "Kaydet",
    "compte.pseudoTaken": "Bu kullanıcı adı zaten alınmış",
    "compte.pseudoUpdated": "Kullanıcı adı güncellendi!",
    "compte.updateError": "Güncelleme sırasında hata",
    "compte.dangerZone": "Tehlikeli bölge",
    "compte.deleteWarning": "Hesabınızın silinmesi geri alınamaz. Tüm verileriniz kaybolacaktır.",
    "compte.deleteAccount": "Hesabımı sil",
    "compte.deleteTitle": "Hesabı sil",
    "compte.deleteDesc": "Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.",
    "compte.deleteConfirmLabel": "Onaylamak için SİL yazın:",
    "compte.deleteConfirmWord": "SİL",
    "compte.cancel": "İptal",
    "compte.confirmDelete": "Silmeyi onayla",
    "compte.deleting": "Siliniyor…",
    "compte.deleted": "Hesap silindi",
    "compte.sessionExpired": "Oturum süresi doldu",
    "compte.deleteError": "Silme sırasında hata",
    "compte.language": "Dil",
    "compte.languageDesc": "Arayüz dilini seçin",

    // Gestion Services
    "services.title": "Servis Yönetimi",
    "services.addService": "Fiş ekle",
    "services.noServices": "Servis fişi yok",
    "services.noServicesDesc": "Başlamak için bir fiş ekleyin",
    "services.model": "Model",
    "services.plate": "Plaka",
    "services.name": "Teknisyen…",
    "services.entry": "Giriş",
    "services.exit": "Çıkış",
    "services.mileage": "km",
    "services.mechanics": "Mekanik",
    "services.bodywork": "Kaporta",
    "services.readOnly": "Salt okunur mod — teknisyen erişimi",
    "services.inProgress": "Devam ediyor",
    "services.toCheck": "Kontrol edilecek",
    "services.done": "Tamamlandı",
    "services.problem": "Sorun!",
    "services.selectSections": "Dahil edilecek bölümler",
    "services.create": "Oluştur",

    // Gestion Véhicules
    "vehicles.title": "Araç Yönetimi",
    "vehicles.vehicle": "araç",
    "vehicles.vehicles": "araç",
    "vehicles.concession": "bayi",
    "vehicles.concessions": "bayi",
    "vehicles.newConcession": "Yeni bayi",
    "vehicles.addConcession": "Bayi ekle",
    "vehicles.concessionName": "Bayi adı…",
    "vehicles.add": "Ekle",
    "vehicles.noConcessions": "Henüz bayi yok",
    "vehicles.noConcessionsSub": "Başlamak için « Yeni bayi » ye tıklayın",
    "vehicles.noVehicles": "Araç yok",
    "vehicles.deleteConcessionConfirm": "« {name} » bayisini ve tüm araçlarını silmek istiyor musunuz?",
    "vehicles.brand": "Marka",
    "vehicles.model": "Model",
    "vehicles.plate": "Plaka",
    "vehicles.state": "Durum",
    "vehicles.tech": "Tek",
    "vehicles.readOnly": "Salt okunur mod — teknisyen erişimi",
  },
};

const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  tr: "Türkçe",
};

const LANG_FLAGS: Record<Lang, string> = {
  fr: "🇫🇷",
  tr: "🇹🇷",
};

type I18nContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string>) => string;
  langs: { code: Lang; label: string; flag: string }[];
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved === "tr" ? "tr" : "fr") as Lang;
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  };

  const t = (key: string, params?: Record<string, string>) => {
    let str = translations[lang][key] || translations.fr[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  };

  const langs = (Object.keys(LANG_LABELS) as Lang[]).map((code) => ({
    code,
    label: LANG_LABELS[code],
    flag: LANG_FLAGS[code],
  }));

  return (
    <I18nContext.Provider value={{ lang, setLang, t, langs }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
