﻿#region Copyright
// DotNetNuke® - http://www.dotnetnuke.com
// Copyright (c) 2002-2016
// by DotNetNuke Corporation
// All Rights Reserved
#endregion

using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Web;
using System.Web.Http;
using Dnn.PersonaBar.Library;
using Dnn.PersonaBar.Library.Attributes;
using DotNetNuke.Application;
using DotNetNuke.Common;
using DotNetNuke.Entities.Host;
using DotNetNuke.Entities.Portals;
using DotNetNuke.Entities.Users;
using DotNetNuke.Services.Exceptions;
using DotNetNuke.Services.Upgrade;

namespace Dnn.PersonaBar.UI.Services
{
    [MenuPermission(Scope = ServiceScope.Regular)]
    public class ServerSummaryController : PersonaBarApiController
    {
        private const string CriticalUpdateHash = "df6ffb888798c1c2d96fa8a24064b748";
        private const string NormalUpdateHash = "5a1ca5548f67d5860b18f2b552c5c295";

        enum UpdateType
        {
            None,
            Normal,
            Critical
        }

        #region Public API methods

        /// <summary>
        /// Return server info.
        /// </summary>
        [HttpGet]
        public HttpResponseMessage GetServerInfo()
        {
            try
            {
                var isHost = UserController.Instance.GetCurrentUserInfo().IsSuperUser;
                var response = new
                {
                    ProductName = DotNetNukeContext.Current.Application.Description,
                    ProductVersion = "v. " + Globals.FormatVersion(DotNetNukeContext.Current.Application.Version, true),
                    FrameworkVersion = isHost ? Globals.NETFrameworkVersion.ToString(2) : string.Empty,
                    ServerName = isHost ? Globals.ServerName : string.Empty,
                    LicenseVisible = isHost && GetVisibleSetting("LicenseVisible"),
                    DocCenterVisible = GetVisibleSetting("DocCenterVisible"),
                };

                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                Exceptions.LogException(ex);
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex.Message);
            }
        }

        [HttpGet]
        public HttpResponseMessage GetUpdateLink()
        {
            UpdateType updateType;
            var url = NeedUpdate(out updateType) ? Upgrade.UpgradeRedirect() : string.Empty;

            return Request.CreateResponse(HttpStatusCode.OK, new {Url = url, Type = updateType});
        }

        private bool GetVisibleSetting(string settingName)
        {
            var portalSettings = PortalController.Instance.GetPortalSettings(PortalId);
            return !portalSettings.ContainsKey(settingName)
                   || string.IsNullOrEmpty(portalSettings[settingName])
                   || portalSettings[settingName] == "true";
        }

        private bool NeedUpdate(out UpdateType updateType)
        {
            updateType = UpdateType.None;
            
            if (HttpContext.Current == null || !Host.CheckUpgrade || !UserInfo.IsSuperUser)
            {
                return false;
            }

            var version = DotNetNukeContext.Current.Application.Version;
            var request = HttpContext.Current.Request;

            var imageUrl = Upgrade.UpgradeIndicator(version, request.IsLocal, request.IsSecureConnection); ;
            imageUrl = Globals.AddHTTP(imageUrl.TrimStart('/'));

            try
            {
                var webRequest = WebRequest.CreateHttp(imageUrl);
                webRequest.Timeout = Host.WebRequestTimeout;
                webRequest.UserAgent = request.UserAgent;
                webRequest.Referer = request.RawUrl;

                using (var stream = ((HttpWebResponse)webRequest.GetResponse()).GetResponseStream())
                {
                    if (stream == null)
                    {
                        return false;
                    }

                    using (var md5 = MD5.Create())
                    {
                        var hash = BitConverter.ToString(md5.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
                        switch (hash)
                        {
                            case NormalUpdateHash:
                                updateType = UpdateType.Normal;
                                return true;
                            case CriticalUpdateHash:
                                updateType = UpdateType.Critical;
                                return true;
                            default:
                                return false;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        #endregion
    }
}
