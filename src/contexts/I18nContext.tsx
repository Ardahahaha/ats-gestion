import { createContext, useContext, useState, ReactNode } from "react";

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
    "menu.title": "Menu",
    "menu.titleHighlight": "Principal",
    "menu.subtitle": "Sélectionnez un module pour commencer",
    "menu.services": "Gestion des Services",
    "menu.servicesDesc": "Suivi mécanique et carrosserie des véhicules",
    "menu.insurance": "GESTION DES ASSURANCES",
    "menu.insuranceDesc": "Suivi des entrées, sorties, travaux et pièces",
    "menu.vehicles": "Gestion des Véhicules",
    "menu.vehiclesDesc": "Suivi par marque : Peugeot, Automalin, Renault",
    "menu.create": "Créer",
    "menu.createDesc": "Créez vos propres tableaux personnalisés",

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
    "compte.allAccounts": "Tous les comptes",
    "compte.allAccountsDesc": "Liste de tous les comptes enregistrés",
    "compte.role": "Rôle",
    "compte.noAccounts": "Aucun compte trouvé",
    "compte.loadingAccounts": "Chargement…",

    // Gestion Services
    "services.title": "Gestion des",
    "services.titleHighlight": "Services",
    "services.vehicleCount": "véhicule(s)",
    "services.add": "Ajouter",
    "services.noServices": "Aucun véhicule en service.",
    "services.noServicesAdmin": " Cliquez sur \"Ajouter\" pour commencer.",
    "services.model": "Modèle",
    "services.plate": "Immat",
    "services.technicianSelect": "Technicien…",
    "services.entry": "Entrée",
    "services.exit": "Sortie",
    "services.mileage": "km",
    "services.mechanics": "Mécanique",
    "services.bodywork": "Carrosserie",
    "services.readOnly": "Mode lecture seule — accès technicien",
    "services.inProgress": "En cours",
    "services.toCheck": "À vérifier",
    "services.done": "Fait ✓",
    "services.problem": "Problème !",
    "services.markDone": "Marquer comme fait",
    "services.markCheck": "Remettre à vérifier",
    "services.newService": "Nouveau service",
    "services.sectionsInclude": "Sections à inclure :",
    "services.mecaDesc": "Diagnostique, vidange, freins…",
    "services.carroDesc": "Peinture, débosselage, lustrage…",
    "services.cancel": "Annuler",
    "services.addBtn": "Ajouter",
    "services.chef": "Chef",
    "services.technician": "Technicien",
    "services.techNotes": "Notes technicien…",
    "services.chefNotes": "Notes chef…",
    "services.notes": "Notes…",
    "services.deleteConfirm": "Supprimer cette ligne ?",
    "services.loading": "Chargement…",
    "services.chooseElement": "① Choisir un élément…",
    "services.vehiclePart": "Élément du véhicule",
    "services.taskFor": "② Tâche pour",
    "services.uploadError": "Erreur upload photo",
    "services.errorLoad": "Erreur chargement services",
    "services.errorAdd": "Erreur ajout",
    "services.selected": "sél.",
    "services.tasks": "tâches",
    "services.addCustomTask": "Tâche personnalisée…",

    // Gestion Véhicules
    "vehicles.title": "Gestion des",
    "vehicles.titleHighlight": "Véhicules",
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
    "vehicles.addVehicle": "Ajouter un véhicule",
    "vehicles.deleteConcession": "Supprimer la concession",
    "vehicles.errorLoad": "Erreur de chargement",
    "vehicles.errorAdd": "Erreur lors de l'ajout",
    "vehicles.errorDelete": "Erreur lors de la suppression",
    "vehicles.errorUpdate": "Erreur lors de la mise à jour",
    "vehicles.alreadyExists": "Cette concession existe déjà",

    // Assurances (VehicleTable)
    "insurance.plate": "Immat",
    "insurance.entry": "Entrée",
    "insurance.client": "Client",
    "insurance.work": "Travaux",
    "insurance.parts": "Pièces",
    "insurance.exit": "Sortie",
    "insurance.addVehicle": "Ajouter un véhicule",
    "insurance.noVehicles": "Aucun véhicule enregistré",
    "insurance.noVehiclesSub": "Cliquez sur \"Ajouter un véhicule\" pour commencer",
    "insurance.loading": "Chargement...",
    "insurance.errorLoad": "Erreur de chargement",
    "insurance.errorAdd": "Erreur lors de l'ajout",
    "insurance.errorDelete": "Erreur lors de la suppression",
    "insurance.errorUpdate": "Erreur lors de la mise à jour",
    "insurance.formatError": "Format invalide — utilisez : XX 123 XX",
    "insurance.restricted": "Accès restreint",
    "insurance.restrictedDesc": "Ce module est réservé aux administrateurs.",

    // Atelier (Créer)
    "atelier.table": "tableau",
    "atelier.tables": "tableaux",
    "atelier.newTable": "Nouveau tableau",
    "atelier.noTables": "Aucun tableau créé",
    "atelier.unnamed": "Sans nom",
    "atelier.delete": "Supprimer",
    "atelier.loading": "Chargement...",
    "atelier.readOnly": "Mode lecture seule — accès technicien",
    "atelier.tableName": "Nom du tableau",
    "atelier.columnName": "Nom de la colonne",
    "atelier.column": "Colonne",
    "atelier.row": "Ligne",
    "atelier.noColumns": "Ajoutez des colonnes pour commencer",
    "atelier.noColumnsReadonly": "Aucune colonne",
    "atelier.noRows": "Aucune ligne",
    "atelier.errorCreate": "Erreur création",
    "atelier.errorAddCol": "Erreur ajout colonne",
    "atelier.errorAddRow": "Erreur ajout ligne",
    "atelier.errorUpdate": "Erreur mise à jour",
    "atelier.deleteCol": "Supprimer colonne",
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
    "menu.title": "Ana",
    "menu.titleHighlight": "Menü",
    "menu.subtitle": "Başlamak için bir modül seçin",
    "menu.services": "Servis Yönetimi",
    "menu.servicesDesc": "Araçların mekanik ve kaporta takibi",
    "menu.insurance": "SİGORTA YÖNETİMİ",
    "menu.insuranceDesc": "Giriş, çıkış, işler ve parça takibi",
    "menu.vehicles": "Araç Yönetimi",
    "menu.vehiclesDesc": "Markaya göre takip: Peugeot, Automalin, Renault",
    "menu.create": "Oluştur",
    "menu.createDesc": "Kendi özel tablolarınızı oluşturun",

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
    "services.title": "Servis",
    "services.titleHighlight": "Yönetimi",
    "services.vehicleCount": "araç",
    "services.add": "Ekle",
    "services.noServices": "Serviste araç yok.",
    "services.noServicesAdmin": " Başlamak için \"Ekle\" ye tıklayın.",
    "services.model": "Model",
    "services.plate": "Plaka",
    "services.technicianSelect": "Teknisyen…",
    "services.entry": "Giriş",
    "services.exit": "Çıkış",
    "services.mileage": "km",
    "services.mechanics": "Mekanik",
    "services.bodywork": "Kaporta",
    "services.readOnly": "Salt okunur mod — teknisyen erişimi",
    "services.inProgress": "Devam ediyor",
    "services.toCheck": "Kontrol edilecek",
    "services.done": "Tamamlandı ✓",
    "services.problem": "Sorun!",
    "services.markDone": "Tamamlandı olarak işaretle",
    "services.markCheck": "Kontrole geri al",
    "services.newService": "Yeni servis",
    "services.sectionsInclude": "Dahil edilecek bölümler:",
    "services.mecaDesc": "Teşhis, yağ değişimi, frenler…",
    "services.carroDesc": "Boya, göçük düzeltme, cilalama…",
    "services.cancel": "İptal",
    "services.addBtn": "Ekle",
    "services.chef": "Şef",
    "services.technician": "Teknisyen",
    "services.techNotes": "Teknisyen notları…",
    "services.chefNotes": "Şef notları…",
    "services.notes": "Notlar…",
    "services.deleteConfirm": "Bu satırı silmek istiyor musunuz?",
    "services.loading": "Yükleniyor…",
    "services.chooseElement": "① Bir eleman seçin…",
    "services.vehiclePart": "Araç elemanı",
    "services.taskFor": "② Görev:",
    "services.uploadError": "Fotoğraf yükleme hatası",
    "services.errorLoad": "Servis yükleme hatası",
    "services.errorAdd": "Ekleme hatası",
    "services.selected": "seç.",
    "services.tasks": "görev",
    "services.addCustomTask": "Özel görev…",

    // Gestion Véhicules
    "vehicles.title": "Araç",
    "vehicles.titleHighlight": "Yönetimi",
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
    "vehicles.addVehicle": "Araç ekle",
    "vehicles.deleteConcession": "Bayiyi sil",
    "vehicles.errorLoad": "Yükleme hatası",
    "vehicles.errorAdd": "Ekleme hatası",
    "vehicles.errorDelete": "Silme hatası",
    "vehicles.errorUpdate": "Güncelleme hatası",
    "vehicles.alreadyExists": "Bu bayi zaten mevcut",

    // Assurances (VehicleTable)
    "insurance.plate": "Plaka",
    "insurance.entry": "Giriş",
    "insurance.client": "Müşteri",
    "insurance.work": "İşler",
    "insurance.parts": "Parçalar",
    "insurance.exit": "Çıkış",
    "insurance.addVehicle": "Araç ekle",
    "insurance.noVehicles": "Kayıtlı araç yok",
    "insurance.noVehiclesSub": "Başlamak için \"Araç ekle\" ye tıklayın",
    "insurance.loading": "Yükleniyor...",
    "insurance.errorLoad": "Yükleme hatası",
    "insurance.errorAdd": "Ekleme hatası",
    "insurance.errorDelete": "Silme hatası",
    "insurance.errorUpdate": "Güncelleme hatası",
    "insurance.formatError": "Geçersiz format — kullanın: XX 123 XX",
    "insurance.restricted": "Erişim kısıtlı",
    "insurance.restrictedDesc": "Bu modül yöneticilere özeldir.",

    // Atelier (Créer)
    "atelier.table": "tablo",
    "atelier.tables": "tablo",
    "atelier.newTable": "Yeni tablo",
    "atelier.noTables": "Oluşturulmuş tablo yok",
    "atelier.unnamed": "İsimsiz",
    "atelier.delete": "Sil",
    "atelier.loading": "Yükleniyor...",
    "atelier.readOnly": "Salt okunur mod — teknisyen erişimi",
    "atelier.tableName": "Tablo adı",
    "atelier.columnName": "Sütun adı",
    "atelier.column": "Sütun",
    "atelier.row": "Satır",
    "atelier.noColumns": "Başlamak için sütun ekleyin",
    "atelier.noColumnsReadonly": "Sütun yok",
    "atelier.noRows": "Satır yok",
    "atelier.errorCreate": "Oluşturma hatası",
    "atelier.errorAddCol": "Sütun ekleme hatası",
    "atelier.errorAddRow": "Satır ekleme hatası",
    "atelier.errorUpdate": "Güncelleme hatası",
    "atelier.deleteCol": "Sütunu sil",
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
