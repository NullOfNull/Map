using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;
using System.IO;
using Genersoft.Platform.Core.Error;

namespace Generoft.AM.Public.Map.Client
{
    public class DataChangedEventArgs : EventArgs
    {
        public DataChangedEventArgs(object oldValue,object newValue)
        {
            OldValue = oldValue;
            NewValue = newValue;
        }
        public object OldValue { get; set; }
        public object NewValue { get; set; }
    }
}
