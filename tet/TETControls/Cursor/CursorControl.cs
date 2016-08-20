/*
 * Copyright (c) 2013-present, The Eye Tribe. 
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree. 
 *
 */
using System;
using System.Windows.Forms;
using TETCSharpClient;
using TETCSharpClient.Data;
using System.Diagnostics;


namespace TETControls.Cursor
{
    public class CursorControl : IGazeListener
    {
        /// <summary>
        /// Holds the running time of current session.
        /// </summary>
        private readonly Stopwatch m_Stopwatch;

        /// <summary>
        /// Running time
        /// </summary>
        private static DateTime m_StartTime;

        private bool m_JsonInitialized;

        private bool m_IsEOF;

        // TODO: Hard code...
       // private string m_Folder = @"C:\Users\ifimv_000\Documents\alsProject\vidi\app\videoLogs";
        private readonly string m_Folder;
        private string m_TargetFile;


        #region Get/Set

        public bool Enabled { get; set; }
        public bool Smooth { get; set; }
        public Screen ActiveScreen { get; set; }

        #endregion

        #region Constuctor

        public CursorControl(string i_Folder)
            : this(Screen.PrimaryScreen, false, false, i_Folder)
        {
            if (m_Stopwatch == null)
            {
                m_Stopwatch = new Stopwatch();
            }
        }

        public CursorControl(Screen screen, bool enabled, bool smooth, string i_Folder)
        {
            GazeManager.Instance.AddGazeListener(this);
            ActiveScreen = screen;
            Enabled = enabled;
            Smooth = smooth;
            m_Folder = i_Folder;
            if (m_Stopwatch == null)
            {
                m_Stopwatch = new Stopwatch();
            }
        }

        #endregion

        #region Public interface methods

        public void OnGazeUpdate(GazeData gazeData)
        {
            if (!Enabled)
            {
                if (!m_IsEOF)
                {
                    closeJsonFile();
                }
                return;
            }

            // start or stop tracking lost animation
            if ((gazeData.State & GazeData.STATE_TRACKING_GAZE) == 0 &&
                (gazeData.State & GazeData.STATE_TRACKING_PRESENCE) == 0) return;

            // tracking coordinates
            var x = ActiveScreen.Bounds.X;
            var y = ActiveScreen.Bounds.Y;
            var gX = Smooth ? gazeData.SmoothedCoordinates.X : gazeData.RawCoordinates.X;
            var gY = Smooth ? gazeData.SmoothedCoordinates.Y : gazeData.RawCoordinates.Y;
            var screenX = (int) Math.Round(x + gX, 0);
            var screenY = (int) Math.Round(y + gY, 0);

            // return in case of 0,0 
            if (screenX == 0 && screenY == 0) return;

            //NativeMethods.SetCursorPos(screenX, screenY);
            writeToExistingFile(screenX, screenY);
        }

        #endregion

        public class NativeMethods
        {
            [System.Runtime.InteropServices.DllImportAttribute("user32.dll", EntryPoint = "SetCursorPos")]
            [return:
                System.Runtime.InteropServices.MarshalAsAttribute(System.Runtime.InteropServices.UnmanagedType.Bool)]

            public static extern bool SetCursorPos(int x, int y);
        }

        #region recording Utils

        private static DateTime m_CurrenTime;
        private static TimeSpan m_TimeElasped;


        private static string SetJsonInformation(int i_ScreenX, int i_ScreenY)
        {
            // Get current time
            m_CurrenTime = DateTime.Now;

            // Evaluate running time
            m_TimeElasped = m_CurrenTime.Subtract(m_StartTime);

            // Set time stamp 
            //TODO: Use GetTimeStamp method.
            string timeStamp = m_TimeElasped.ToString();

            string strToReturn = SetJsonFormat(i_ScreenX, i_ScreenY, timeStamp, m_TimeElasped.Seconds);
            return strToReturn;
        }

        /// <summary>
        /// Set information in string
        /// </summary>
        /// <param name="xPosition">X Position</param>
        /// <param name="yPosition">Y Position</param>
        /// <param name="timeStamp">Current timeStamp</param>
        /// <returns></returns>
        private static string SetJsonFormat(int xPosition, int yPosition, string timeStamp, int seconds)
        {
            return
                string.Format(
                    "{{\n \"x\": {0},\n\"y\": {1},\n \"timeStamp\" : \"{2}\",\n \"second\" : \"{3}\"\n }},\n", xPosition,
                    yPosition, timeStamp, seconds);

        }



        public void writeToExistingFile(int i_ScreenX, int i_ScreenY)
        {
            if (!m_Stopwatch.IsRunning)
            {
                m_Stopwatch.Start();
                m_StartTime = DateTime.Now;
                m_TargetFile = string.Format("{0}\\{1:dd-MM-yyyy_hh-mm-ss-tt}.json", m_Folder, m_StartTime);
            }

            string toWrite = SetJsonInformation(i_ScreenX, i_ScreenY);

            using (
                System.IO.StreamWriter file =
                    new System.IO.StreamWriter(m_TargetFile, true)
                )
            {
                if (!m_JsonInitialized)
                {
                    // json start
                    file.WriteLine(("{\n \"data\":[\n"));
                    m_JsonInitialized = true;
                }

                file.WriteLine(toWrite);
            }
        }

        private void closeJsonFile()
        {
            using (
                System.IO.StreamWriter file =
                    new System.IO.StreamWriter(m_TargetFile, true)
                )
            {
                file.WriteLine("{}\n]}");
                m_IsEOF = true;
            }

        }

        #endregion
    }
}